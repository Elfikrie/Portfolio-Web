import React from "react";
import db from "@/lib/db";

export default async function ExperiencePage() {
  const [experiences]: any = await db.query('SELECT * FROM experiences ORDER BY id DESC');
  const [organizations]: any = await db.query('SELECT * FROM organizations ORDER BY id DESC');

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-16 text-center" data-aos="fade-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Experience & <span className="text-salmon-500">Organizations</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          My professional journey and organizational involvement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Work Experience */}
        <section>
          <h2 data-aos="fade-right" className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-8 h-1 bg-salmon-500 rounded-full"></span>
            Work Experience
          </h2>
          <div className="relative border-l border-zinc-800 pl-8 ml-4 space-y-12">
            {experiences.map((exp: any, index: number) => (
              <div key={exp.id} data-aos="fade-left" data-aos-delay={index * 150} className="relative">
                <div className="absolute -left-[41px] top-2 w-5 h-5 rounded-full bg-zinc-900 border-4 border-salmon-500 shadow-[0_0_10px_rgba(250,128,114,0.3)]"></div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-salmon-500/30 transition-all duration-300">
                  <span className="text-xs font-semibold text-salmon-500 mb-2 inline-block bg-salmon-500/10 px-3 py-1 rounded-full">{exp.duration}</span>
                  <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                  <h4 className="text-base text-gray-400 mb-4 font-medium">{exp.company}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{exp.description}</p>
                </div>
              </div>
            ))}
            {experiences.length === 0 && <span className="text-zinc-500">No experience yet.</span>}
          </div>
        </section>

        {/* Organizations */}
        <section>
          <h2 data-aos="fade-right" className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-8 h-1 bg-salmon-500 rounded-full"></span>
            Organizations
          </h2>
          <div className="relative border-l border-zinc-800 pl-8 ml-4 space-y-12">
            {organizations.map((org: any, index: number) => (
              <div key={org.id} data-aos="fade-left" data-aos-delay={index * 150} className="relative">
                <div className="absolute -left-[41px] top-2 w-5 h-5 rounded-full bg-zinc-900 border-4 border-salmon-500 shadow-[0_0_10px_rgba(250,128,114,0.3)]"></div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-salmon-500/30 transition-all duration-300">
                  <span className="text-xs font-semibold text-salmon-500 mb-2 inline-block bg-salmon-500/10 px-3 py-1 rounded-full">{org.duration}</span>
                  <h3 className="text-xl font-bold text-white">{org.role}</h3>
                  <h4 className="text-base text-gray-400 mb-4 font-medium">{org.name}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{org.description}</p>
                </div>
              </div>
            ))}
            {organizations.length === 0 && <span className="text-zinc-500">No organizations yet.</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
