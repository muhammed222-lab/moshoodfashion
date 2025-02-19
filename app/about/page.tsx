import React from "react";

const page = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://source.unsplash.com/random/1200x400?fashion,store')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">
            About Moshood Fashion
          </h1>
        </div>
      </section>

      {/* About Content */}
      <section className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
        <p className="mb-4 text-gray-700">
          Welcome to Moshood Fashion Store, where style meets quality. We
          specialize in the latest fashion trends and offer a curated collection
          of premium apparel and accessories to elevate your look. Whether
          you&apos;re after everyday wear or something unique, our collection is
          designed to inspire.
        </p>
        <p className="mb-4 text-gray-700">
          Our commitment is to provide exceptional fashion solutions that blend
          comfort, modern design, and affordability. We believe in making
          fashion accessible to everyone, whether shopping online or in-store.
          Let your style shine with Moshood Fashion.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Our Location</h2>
        <p className="mb-4 text-gray-700">
          Ground floor, <br />
          R&R plaza, beside LOPA, Opp Surry Car Wash, along Ogbere River, <br />
          Palace Way Junction, Igbaire, Okesopin, <br />
          Ijebu Igbo, <br />
          Ijebu North, Ogun State
        </p>

        {/* Map Embed */}
        <div className="w-full h-64 mb-6">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src="https://www.openstreetmap.org/export/embed.html?bbox=3.45,6.90,3.52,7.05&amp;layer=mapnik&amp;marker=6.97,3.48"
            title="Moshood Fashion Location"
          ></iframe>
        </div>
        <p className="text-xs text-gray-500">
          <a
            href="https://www.openstreetmap.org/?mlat=6.97&amp;mlon=3.48#map=15/6.97/3.48"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Larger Map
          </a>
        </p>
      </section>
    </div>
  );
};

export default page;
