import React from "react";

const About = () => {
  return (
    <section id="about" className="bg-white px-5 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        {/* Left side - Image */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80"
            alt="Beautiful Himalayan landscape in Nepal"
            className="h-[350px] w-full rounded-3xl object-cover shadow-lg md:h-[450px]"
          />

          <div className="absolute -bottom-5 -right-3 rounded-2xl bg-white p-5 shadow-xl md:right-5">
            <p className="text-3xl font-bold text-blue-600">100%</p>
            <p className="text-sm text-gray-500">Travel comfort</p>
          </div>
        </div>

        {/* Right side - Content */}
        <div>
          <p className="mb-3 font-semibold uppercase tracking-widest text-blue-600">
            About Stayora
          </p>

          <h2 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            Your Journey Begins With The Perfect Stay
          </h2>

          <p className="mb-5 leading-7 text-gray-600">
            At Stayora, we believe every great journey starts with a comfortable
            place to stay. We help travelers discover wonderful hotels and
            memorable destinations across Nepal.
          </p>

          <p className="mb-8 leading-7 text-gray-600">
            Whether you're planning a peaceful escape in Pokhara, exploring the
            culture of Kathmandu, or enjoying a mountain adventure, Stayora
            makes finding your next stay simple.
          </p>

          {/* Features */}
          <div className="mb-8 grid grid-cols-2 gap-5">
            <div>
              <h3 className="mb-1 font-bold text-gray-900">Easy Booking</h3>
              <p className="text-sm leading-6 text-gray-500">
                Find your stay with a simple booking experience.
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-bold text-gray-900">Amazing Places</h3>
              <p className="text-sm leading-6 text-gray-500">
                Explore beautiful destinations across Nepal.
              </p>
            </div>
          </div>

          <a
            href="#hotels"
            className="inline-block rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-700"
          >
            Explore Hotels →
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
