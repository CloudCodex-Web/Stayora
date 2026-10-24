import React from "react";
import SearchBar from "./SearchBar";
const Hero = ({ onSearch }) => {
  return (
    <section className="bg-white px-5 pb-16 pt-10 md:px-10 md:pt-16">
      <div
        className="relative mx-auto flex min-h-[420px] max-w-7xl items-center overflow-hidden rounded-3xl bg-cover bg-center px-6 py-16 md:px-14 lg:min-h-[500px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(10,35,28,0.85), rgba(10,35,28,0.2)), url('https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1800&q=85')",
        }}
      >
        <div className="max-w-2xl text-white">
          <span className="inline-block rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
            Your next adventure starts here
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
            Find your perfect
            <span className="block text-amber-300">stay in Nepal.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 md:text-lg">
            From peaceful lakeside retreats to luxury mountain escapes, discover
            a place that feels like home.
          </p>

          <a
            href="#search"
            className="mt-8 inline-block rounded-full bg-amber-400 px-7 py-3 font-bold text-gray-900 transition hover:bg-amber-300"
          >
            Explore Stays →
          </a>
        </div>
      </div>

      <div id="search" className="relative z-10 mx-auto -mt-8 max-w-6xl">
        <SearchBar onSearch={onSearch} />
      </div>
    </section>
  );
};

export default Hero;
