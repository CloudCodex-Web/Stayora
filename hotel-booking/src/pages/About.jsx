import {
  Compass,
  Heart,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Easy Discovery",
    description:
      "Find hotels and explore destinations with simple search and helpful filters.",
  },
  {
    icon: Heart,
    title: "Personalized Stays",
    description:
      "Save your favorite hotels and keep your preferred destinations close.",
  },
  {
    icon: ShieldCheck,
    title: "Simple Booking",
    description:
      "Manage booking requests and follow their status from your account.",
  },
];

function About() {
  return (
    <section
      id="about"
      className="overflow-hidden bg-white px-5 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
            <Sparkles size={15} />
            Discover Stayora
          </span>

          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            More Than a Stay.
            <span className="block text-emerald-700">
              It's Part of Your Journey.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500">
            Every journey deserves a comfortable place to begin. Stayora helps
            you discover wonderful stays and explore memorable destinations
            across Nepal.
          </p>
        </div>

        {/* Main content */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image section */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85"
                alt="Beautiful Himalayan landscape in Nepal"
                loading="lazy"
                className="h-[350px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[450px] lg:h-[520px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 p-6 text-white sm:p-9">
                <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                  Explore Nepal
                </span>

                <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
                  Discover places worth remembering.
                </h3>

                <p className="mt-2 text-sm text-white/80">
                  Your next adventure starts with the right stay.
                </p>
              </div>
            </div>

            {/* Floating destination card */}
            <div className="absolute -bottom-6 right-3 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:right-6 sm:p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <MapPin size={25} className="text-emerald-700" />
              </div>

              <div>
                <p className="text-xs text-gray-500">Your next destination</p>

                <p className="font-bold text-gray-900">Somewhere Beautiful</p>
              </div>
            </div>
          </div>

          {/* Text section */}
          <div className="pt-5 lg:pt-0">
            <span className="text-sm font-bold uppercase tracking-widest text-emerald-700">
              About Stayora
            </span>

            <h3 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
              Your Journey Begins With The Perfect Stay
            </h3>

            <p className="mt-6 leading-8 text-gray-600">
              At Stayora, we believe every great journey starts with finding the
              right place to stay. We bring hotel discovery and booking
              management together in one convenient experience.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              Whether you're planning a peaceful escape in Pokhara, exploring
              the culture of Kathmandu, or looking forward to a mountain
              adventure, Stayora makes discovering your next stay simple.
            </p>

            {/* Features */}
            <div className="mt-9 space-y-5">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition duration-300 hover:border-emerald-200 hover:bg-emerald-50/50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
                      <Icon size={23} />
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900">
                        {feature.title}
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <a
              href="#hotels"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-emerald-700 px-7 py-4 font-bold text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-emerald-800 hover:shadow-lg"
            >
              Explore Hotels
              <ArrowRight size={19} />
            </a>
          </div>
        </div>

        {/* Bottom message */}
        <div className="mt-24 rounded-3xl border border-emerald-100 bg-emerald-50/60 px-6 py-10 text-center sm:px-12">
          <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Find Your Place. Make Your Journey.
          </h3>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
            From discovering your favorite hotel to managing your booking
            requests, make every step of your travel planning easier with
            Stayora.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;

