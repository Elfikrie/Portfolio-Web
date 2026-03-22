export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl: string;
  tags: string[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  comments: Comment[];
}

export const dummyProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Website",
    description: "A fullstack e-commerce solution with Next.js and Stripe.",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
    demoUrl: "https://example.com/ecommerce",
    tags: ["Next.js", "Tailwind", "Stripe"],
  },
  {
    id: "2",
    title: "AI Chat Application",
    description: "Real-time AI chat application built with React and Socket.io.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    demoUrl: "https://example.com/ai-chat",
    tags: ["React", "Node.js", "Socket.io"],
  },
  {
    id: "3",
    title: "Portfolio Template",
    description: "Modern minimalist portfolio template for developers.",
    imageUrl: "https://images.unsplash.com/photo-1507238692062-110ce0a71465?auto=format&fit=crop&q=80&w=800",
    demoUrl: "https://example.com/portfolio",
    tags: ["Next.js", "Tailwind", "Framer Motion"],
  }
];

export const dummyNotes: Note[] = [
  {
    id: "1",
    title: "Getting started with Next.js 15",
    content: "Today I learned about the new features in Next.js 15 including the updated React 19 capabilities and Tailwind 4 integration. It feels much faster and cleaner.",
    date: "2026-03-21",
    tags: ["Next.js", "Learning", "React"],
    comments: [
      { id: "c1", author: "John", content: "Great read! Super helpful.", date: "2026-03-21" }
    ],
  },
  {
    id: "2",
    title: "Why I love Tailwind CSS",
    content: "Utility-first CSS frameworks have completely changed the way I build UIs. Instead of writing custom CSS classes, I can just use utility classes to build exactly what I need directly in my JSX without leaving the file.",
    date: "2026-03-20",
    tags: ["CSS", "Tailwind", "Design"],
    comments: [],
  }
];

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-100
}

export const hardSkills: Skill[] = [
  { id: "h1", name: "JavaScript", level: 90 },
  { id: "h2", name: "TypeScript", level: 85 },
  { id: "h3", name: "React", level: 95 },
  { id: "h4", name: "Next.js", level: 90 },
  { id: "h5", name: "Tailwind CSS", level: 95 },
  { id: "h6", name: "Node.js", level: 80 },
  { id: "h7", name: "SQL", level: 75 }
];

export const softSkills: Skill[] = [
  { id: "s1", name: "Communication", level: 90 },
  { id: "s2", name: "Problem Solving", level: 95 },
  { id: "s3", name: "Team Leadership", level: 85 },
  { id: "s4", name: "Adaptability", level: 90 }
];

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Organization {
  id: string;
  role: string;
  name: string;
  duration: string;
  description: string;
}

export const dummyExperiences: Experience[] = [
  {
    id: "e1",
    role: "Fullstack Developer",
    company: "Tech Solutions Inc.",
    duration: "2024 - Present",
    description: "Developing scalable web applications using Next.js and Node.js. Integrated various third-party services and optimized database queries."
  },
  {
    id: "e2",
    role: "Frontend Engineer Intern",
    company: "Creative Agency",
    duration: "2023 - 2024",
    description: "Built pixel-perfect UI components and maintained design systems with Tailwind CSS."
  }
];

export const dummyOrganizations: Organization[] = [
  {
    id: "o1",
    role: "Head of Technology",
    name: "University Computer Science Club",
    duration: "2023 - 2024",
    description: "Led a team of 15 students to develop solutions for local businesses and hosted monthly tech bootcamps."
  },
  {
    id: "o2",
    role: "Core Member",
    name: "Developer Student Club",
    duration: "2022 - 2023",
    description: "Organized hackathons, managed technical workshops, and partnered with local developer communities."
  }
];
