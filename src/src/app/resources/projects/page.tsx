import type { Metadata } from "next";
import Image from "next/image";
import ProjectsClient from "./ProjectsClient";
import projectsData from "@/../../data/projects.json";

export const metadata: Metadata = {
  title: "Project Records",
  description: "Search and browse previous project records of ANSAR TECHNOLOGIES SDN. BHD.",
};

export default function Page() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section
        id="hero"
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/projects.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Project Records</h1>
              <p className="text-justify">Browse our past projects across government and private sectors. Use filters to quickly narrow down by year, sector, category or client.</p>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/projects-hero.png" className="img-fluid animated" alt="Project Records" width={800} height={600} priority />
            </div>
          </div>
        </div>
      </section>

      <ProjectsClient initialProjects={projectsData} />
    </main>
  );
}
