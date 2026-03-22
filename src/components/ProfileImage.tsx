"use client";

import React from "react";

export function ProfileImage() {
  return (
    <img 
      src="/Profile.jpg" 
      alt="Muhammad Fikrie El Muqoffa" 
      className="w-full h-full object-cover bg-zinc-800"
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Fikrie+El+Muqoffa&background=FA8072&color=fff&size=400';
      }} 
    />
  );
}
