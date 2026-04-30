'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

interface ExpenseCategory {
  id: number;
  code: string;
  category: string;
}

interface ExpenseItem {
  item_date: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  remarks: string;
}

interface Expense {
  id: number;
  expense_number: string;
  expense_date: string;
  category: string;
  vendor_name: string;
  invoice_number: string;
  description: string;
  total_amount: number;
  tax_amount: number;
  payment_method: string;
  payment_reference: string;
  status: string;
  receipt_url: string | null;
  reviewed_by_name: string | null;
  items_count: number;
}

export default function EmployeeExpenses({ sessionHash, employeeId }: { sessionHash: string; employeeId: number | null }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const [formData, setFormData] = useState({
    category_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    invoice_number: '',
    description: '',
    tax_amount: '0.00',
    payment_method: 'bank_transfer',
    payment_reference: '',
    remarks: '',
    items: [] as ExpenseItem[]
  });
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    if (employeeId) {
      fetchExpensesData();
    }
  }, [employeeId, sessionHash]);

  const fetchExpensesData = async () => {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes] = await Promise.all([
        fetch(`/api/employee/expenses?hash=${sessionHash}&employee_id=${employeeId}`),
        fetch(`/api/employee/expenses/categories?hash=${sessionHash}&employee_id=${employeeId}`)
      ]);

      if (expensesRes.ok) setExpenses((await expensesRes.json()).expenses || []);
      if (categoriesRes.ok) setCategories((await categoriesRes.json()).categories || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        item_date: new Date().toISOString().split('T')[0],
        description: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        remarks: ''
      }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof ExpenseItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = parseFloat(formData.tax_amount) || 0;
    return itemsTotal + taxAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      return alert('Please add at least one expense item');
    }
    
    if (!receiptFile) {
      return alert('Please upload a receipt');
    }

    const formDataToSend = new FormData();
    formDataToSend.append('employee_id', String(employeeId));
    formDataToSend.append('category_id', formData.category_id);
    formDataToSend.append('expense_date', formData.expense_date);
    formDataToSend.append('vendor_name', formData.vendor_name);
    formDataToSend.append('invoice_number', formData.invoice_number);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('tax_amount', formData.tax_amount);
    formDataToSend.append('payment_method', formData.payment_method);
    formDataToSend.append('payment_reference', formData.payment_reference);
    formDataToSend.append('remarks', formData.remarks);
    formDataToSend.append('items', JSON.stringify(formData.items));
    formDataToSend.append('receipt', receiptFile);

    try {
      const response = await fetch(`/api/employee/expenses/submit?hash=${sessionHash}`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        alert('Expense submitted successfully');
        
        // Emit notification to admins
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            console.log('📤 Emitting task_submitted for expense:', result.expense_number);
            socket.emit('task_submitted', {
              module: 'expenses',
              action: 'submit',
              employeeId,
              entityId: result.expense_number,
              message: `New expense ${result.expense_number} submitted`,
              view: 'expenses'
            });
            console.log('✅ Notification emitted successfully');
          } else {
            console.warn('⚠️ Socket not connected, notification not sent');
          }
        } catch (err) {
          console.error('❌ Error emitting notification:', err);
        }
        
        setShowSubmitModal(false);
        setFormData({
          category_id: '',
          expense_date: new Date().toISOString().split('T')[0],
          vendor_name: '',
          invoice_number: '',
          description: '',
          tax_amount: '0.00',
          payment_method: 'bank_transfer',
          payment_reference: '',
          remarks: '',
          items: []
        });
        setReceiptFile(null);
        fetchExpensesData();
      } else {
        alert((await response.json()).error || 'Failed to submit expense');
      }
    } catch (err) {
      alert('Error submitting expense');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>My Expenses</h2>
        <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
          <i className="bi bi-plus-circle me-1"></i>Submit Expense
        </button>
      </div>

      <div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: '2px' }}>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ fontSize: 11, padding: '12px' }}>Expense No.</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Date</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Category</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Vendor</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Amount</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Items</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Status</th>
                  <th style={{ fontSize: 11, padding: '12px' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4">No expenses found</td></tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ padding: '12px' }}>{exp.expense_number}</td>
                      <td style={{ padding: '12px' }}>{new Date(exp.expense_date).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '12px' }}>{exp.category}</td>
                      <td style={{ padding: '12px' }}>{exp.vendor_name || '-'}</td>
                      <td style={{ padding: '12px' }}>RM {parseFloat(String(exp.total_amount)).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge bg-secondary" style={{ fontSize: 10 }}>{exp.items_count} items</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge bg-${exp.status === 'approved' ? 'success' : exp.status === 'rejected' ? 'danger' : 'warning'}`} style={{ fontSize: 10 }}>
                          {exp.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {exp.receipt_url ? (
                          <a
                            href={`/api/employee/expenses/receipt?hash=${sessionHash}&expense_id=${exp.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: 10, padding: '4px 8px' }}
                          >
                            <i className="bi bi-file-earmark-pdf"></i>
                          </a>
                        ) : (
                          <span className="text-muted" style={{ fontSize: 10 }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl" style={{ maxHeight: '90vh', margin: '1.75rem auto' }}>
            <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                <h5 className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Submit Expense
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowSubmitModal(false)} style={{ fontSize: '10px' }}></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                  <div className="row g-3">
                    {/* Category, Expense Date, Vendor Name */}
                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Category <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Expense Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.expense_date}
                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Vendor Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.vendor_name}
                        onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                        placeholder="Enter vendor name"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Invoice Number */}
                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        placeholder="Enter invoice number"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Receipt Upload */}
                    <div className="col-md-6">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Receipt <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*,.pdf"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                        required
                      />
                      <small style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Upload image or PDF (Max 5MB)
                      </small>
                    </div>

                    {/* Description */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Description <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        className="form-control"
                        required
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter expense description"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Payment Method, Payment Reference, Tax Amount */}
                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Payment Method <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Payment Reference
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.payment_reference}
                        onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                        placeholder="Transaction/Ref number"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Tax Amount (RM)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.tax_amount}
                        onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                        placeholder="0.00"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Remarks */}
                    <div className="col-md-12">
                      <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
                        Remarks
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Additional remarks (optional)"
                        style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '2px' }}
                      />
                    </div>

                    {/* Expense Items */}
                    <div className="col-md-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: 0 }}>
                          Expense Items <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <button
                          type="button"
                          onClick={addItem}
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '10px', padding: '4px 12px', borderRadius: '2px' }}
                        >
                          <i className="bi bi-plus me-1"></i>
                          Add Item
                        </button>
                      </div>

                      {formData.items.length === 0 ? (
                        <div className="text-center py-3" style={{ backgroundColor: '#f9fafb', borderRadius: '2px', border: '1px dashed #d1d5db' }}>
                          <p className="text-muted mb-0" style={{ fontSize: '11px' }}>No items added. Click "Add Item" to begin.</p>
                        </div>
                      ) : (
                        <div className="border rounded" style={{ padding: '12px', backgroundColor: '#f9fafb' }}>
                          {formData.items.map((item, index) => (
                            <div key={index} className="mb-3 p-3" style={{ backgroundColor: '#ffffff', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>Item {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="btn btn-sm btn-outline-danger"
                                  style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '2px' }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                              <div className="row g-2">
                                <div className="col-md-3">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Date <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    required
                                    value={item.item_date}
                                    onChange={(e) => updateItem(index, 'item_date', e.target.value)}
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Description <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    placeholder="Item description"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Qty <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    required
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    placeholder="1"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Unit Price (RM) <span style={{ color: '#ef4444' }}>*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    required
                                    value={item.unit_price}
                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px' }}
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
                                    Total (RM)
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={item.total_price.toFixed(2)}
                                    readOnly
                                    style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '2px', backgroundColor: '#f9fafb', fontWeight: 600 }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div style={{ 
                            backgroundColor: '#dcfce7', 
                            border: '1px solid #bbf7d0', 
                            borderRadius: '2px', 
                            padding: '12px',
                            marginTop: '12px'
                          }}>
                            <div style={{ fontSize: '11px', color: '#166534', marginBottom: '4px' }}>Total Amount</div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>
                              RM {calculateTotal().toFixed(2)}
                            </div>
                            <div style={{ fontSize: '10px', color: '#166534', marginTop: '4px' }}>
                              Items: RM {formData.items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)} + Tax: RM {formData.tax_amount}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="btn btn-outline-secondary"
                    style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '6px' }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Submit Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
