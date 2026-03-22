import Link from "next/link";
import db from "@/lib/db";
import { Button } from "@/components/Button";
import { Typewriter } from "@/components/Typewriter";
import { ProfileImage } from "@/components/ProfileImage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projectsRows]: any = await db.query('SELECT * FROM projects ORDER BY id DESC LIMIT 2');
  const [notesRows]: any = await db.query('SELECT * FROM notes ORDER BY id DESC LIMIT 2');
  const [hardSkillsRows]: any = await db.query('SELECT * FROM skills WHERE type="hard" LIMIT 4');
  const [softSkillsRows]: any = await db.query('SELECT * FROM skills WHERE type="soft" LIMIT 2');
  
  const topSkills = [...hardSkillsRows, ...softSkillsRows];

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section 
        className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-salmon-500/10 via-transparent to-transparent z-0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
              <h1 data-aos="fade-right" data-aos-delay="100" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Hi, I'm Muhammad Fikrie El Muqoffa
              </h1>
              <div data-aos="fade-right" data-aos-delay="300" className="mt-2 text-2xl md:text-3xl lg:text-4xl font-bold h-12 flex items-center justify-center lg:justify-start mb-8">
                <Typewriter 
                  words={[
                    { text: "A Tech Enthusiast", className: "text-salmon-500" },
                    { text: "A Fullstack Developer", className: "text-gray-300" },
                    { text: "A Data Analyst", className: "text-gray-300" },
                    { text: "A Prompt Engineer", className: "text-gray-300" }
                  ]} 
                />
              </div>
              <div data-aos="fade-up" data-aos-delay="500" className="flex items-center justify-center lg:justify-start gap-4">
                <Link href="/projects">
                  <Button size="lg" className="rounded-full">View My Work</Button>
                </Link>
                <Link href="/notes">
                  <Button variant="outline" size="lg" className="rounded-full">Read My Notes</Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Photo */}
            <div data-aos="zoom-in" data-aos-delay="200" className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative group w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                {/* Decorative background blurs / accents */}
                <div className="absolute inset-0 bg-salmon-500/20 rounded-full blur-3xl group-hover:bg-salmon-500/30 transition-all duration-700"></div>
                <div className="absolute -inset-4 border-2 border-salmon-500/30 rounded-full animate-[spin_10s_linear_infinite] group-hover:border-salmon-500/50 transition-colors duration-500"></div>
                
                {/* The actual image container */}
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-zinc-900 shadow-2xl z-10 scale-100 group-hover:scale-105 transition-transform duration-500 ease-in-out">
                  <div className="absolute inset-0 bg-gradient-to-tr from-salmon-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                  <ProfileImage />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div data-aos="fade-up" className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-8 h-1 bg-salmon-500 rounded-full"></span>
            Top Skills
          </h2>
          <Link href="/skills" className="text-sm font-semibold text-salmon-500 hover:text-salmon-400 transition-colors">
            View All &rarr;
          </Link>
        </div>
        <div data-aos="fade-up" data-aos-delay="100" className="flex flex-wrap gap-3">
          {topSkills.map((skill: any, index: number) => (
            <span key={skill.id} data-aos="fade-up" data-aos-delay={150 + index * 50} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-gray-300 font-medium hover:border-salmon-500/50 hover:text-salmon-400 transition-colors cursor-default">
              {skill.name}
            </span>
          ))}
          {topSkills.length === 0 && <span className="text-zinc-500">No skills published yet.</span>}
        </div>
      </section>

      {/* Recent Projects */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div data-aos="fade-up" className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-8 h-1 bg-salmon-500 rounded-full"></span>
            Recent Projects
          </h2>
          <Link href="/projects" className="text-sm font-semibold text-salmon-500 hover:text-salmon-400 transition-colors">
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projectsRows.map((project: any, index: number) => {
            const tags = Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? JSON.parse(project.tags) : []);
            return (
              <div key={project.id} data-aos="fade-up" data-aos-delay={index * 150} className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-salmon-500/50 transition-all duration-300 flex flex-col">
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
                    {tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-zinc-800 text-gray-300 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {(project.demoUrl || project.demourl) && (
                    <a href={project.demoUrl || project.demourl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">View Live Project</Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          {projectsRows.length === 0 && <span className="text-zinc-500">No projects published yet.</span>}
        </div>
      </section>

      {/* Recent Notes */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div data-aos="fade-up" className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-8 h-1 bg-salmon-500 rounded-full"></span>
            Daily Notes
          </h2>
          <Link href="/notes" className="text-sm font-semibold text-salmon-500 hover:text-salmon-400 transition-colors">
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {notesRows.map((note: any, index: number) => (
            <div key={note.id} data-aos="fade-up" data-aos-delay={index * 100} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-2">
                <Link href={`/notes/${note.id}`} className="hover:text-salmon-400 transition-colors">
                  <h3 className="text-lg font-bold text-white">{note.title}</h3>
                </Link>
                <span className="text-xs text-salmon-500 font-medium whitespace-nowrap">{note.date}</span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{note.content}</p>
            </div>
          ))}
          {notesRows.length === 0 && <span className="text-zinc-500">No notes published yet.</span>}
        </div>
      </section>
    </div>
  );
}
