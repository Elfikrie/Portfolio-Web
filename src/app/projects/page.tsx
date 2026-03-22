import React from "react";
import db from "@/lib/db";
import { Button } from "@/components/Button";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [rows]: any = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
  
  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-12" data-aos="fade-up">
        <h1 className="text-4xl font-extrabold text-white mb-4">My <span className="text-salmon-500">Projects</span></h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          A collection of projects I've worked on. Each project represents a unique challenge and learning experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rows.map((project: any, index: number) => {
          const tags = Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? JSON.parse(project.tags) : []);
          return (
            <div key={project.id} data-aos="fade-up" data-aos-delay={index * 100} className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-salmon-500/50 transition-all duration-300 flex flex-col">
              <div className="aspect-video w-full bg-zinc-800 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-zinc-700 transition-transform duration-500 group-hover:scale-105 bg-cover bg-center"
                  style={{ backgroundImage: `url(${project.imageUrl || project.imageurl})` }}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-1">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag: string) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-zinc-800 text-gray-300 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                {(project.demoUrl || project.demourl) && (
                  <a href={project.demoUrl || project.demourl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full shadow-none group-hover:shadow-salmon-500/20 shadow-md">
                      Visit Website &rarr;
                    </Button>
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500 py-12">
            No projects published yet.
          </div>
        )}
      </div>
    </div>
  );
}
