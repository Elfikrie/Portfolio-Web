import React from "react";
import db from "@/lib/db";

const SkillCard = ({ skill, delay }: { skill: any; delay: number }) => (
  <div data-aos="fade-up" data-aos-delay={delay} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-salmon-500/30 transition-all duration-300">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-white">{skill.name}</h3>
      <span className="text-salmon-500 font-mono text-sm">{skill.level}%</span>
    </div>
    <div className="w-full bg-zinc-800 rounded-full h-2">
      <div
        className="bg-salmon-500 h-2 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${skill.level}%` }}
      />
    </div>
  </div>
);

export default async function SkillsPage() {
  const [rows]: any = await db.query('SELECT * FROM skills ORDER BY level DESC');
  const hardSkills = rows.filter((s: any) => s.type === 'hard');
  const softSkills = rows.filter((s: any) => s.type === 'soft');

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-16" data-aos="fade-up">
        <h1 className="text-4xl font-extrabold text-white mb-4">My <span className="text-salmon-500">Skills</span></h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          Here is an overview of the technical and interpersonal skills I've developed throughout my journey as a tech enthusiast.
        </p>
      </div>

      <div className="mb-16">
        <h2 data-aos="fade-right" className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span className="w-6 h-1 bg-salmon-500 rounded-full"></span>
          Hard Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hardSkills.map((skill: any, index: number) => (
            <SkillCard key={skill.id} skill={skill} delay={index * 80} />
          ))}
          {hardSkills.length === 0 && <span className="text-zinc-500">No hard skills found.</span>}
        </div>
      </div>

      <div>
        <h2 data-aos="fade-right" className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span className="w-6 h-1 bg-salmon-500 rounded-full"></span>
          Soft Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {softSkills.map((skill: any, index: number) => (
            <SkillCard key={skill.id} skill={skill} delay={index * 80} />
          ))}
          {softSkills.length === 0 && <span className="text-zinc-500">No soft skills found.</span>}
        </div>
      </div>
    </div>
  );
}
