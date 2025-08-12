import PixelTransition from "@/components/PixelTransition";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

const teamMembers = [
  {
    name: "Rijan Shakya",
    role: "Founder & CEO",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    description:
      "Visionary leader and passionate about building amazing products.",
  },
  {
    name: "Sita Rai",
    role: "Lead Designer",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    description:
      "Creative mind behind our sleek and user-friendly designs.",
  },
  {
    name: "Ram Thapa",
    role: "Senior Developer",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
    description:
      "Code ninja making sure everything runs smoothly and efficiently.",
  },
];

export default function AboutPage() {
  return (
    <>
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto", textAlign: "center" }}>
      {/* Our Story with image side by side */}
      <h1 style={{ fontSize: "2.8rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Our Story
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          marginBottom: "3rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#555", lineHeight: "1.6rem", flex: "1 1 300px", minWidth: "280px" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec
          dui euismod, commodo urna in, convallis erat. Praesent dignissim
          pharetra justo, id congue nulla. Maecenas a lorem vitae magna suscipit
          efficitur. Morbi consectetur nunc eu nulla faucibus, nec condimentum
          purus efficitur. Donec faucibus lorem nec leo pretium, nec convallis
          urna ultricies. Pellentesque habitant morbi tristique senectus et
          netus et malesuada fames ac turpis egestas. Nullam malesuada semper
          rhoncus.
        </p>
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
          alt="Our story"
          width={300}
          height={200}
          style={{ objectFit: "cover", borderRadius: "12px", flexShrink: 0 }}
        />
      </div>

      {/* Our Values Section */}
      <h2 style={{ fontSize: "2.4rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Our Values
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2.5rem",
          flexWrap: "wrap",
          marginBottom: "3rem",
        }}
      >
        {[
          {
            title: "Quality Assurance",
            description:
              "We strive for excellence and ensure the highest standards in every product.",
          },
          {
            title: "Customer Focus",
            description:
              "Our customers are at the heart of everything we do. Their satisfaction drives us.",
          },
          {
            title: "Innovation",
            description:
              "Constantly pushing boundaries to create cutting-edge solutions.",
          },
        ].map(({ title, description }) => (
          <div
            key={title}
            style={{
              maxWidth: "280px",
              backgroundColor: "#f9f9f9",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              textAlign: "left",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              {title}
            </h3>
            <p style={{ color: "#555", fontSize: "0.95rem" }}>{description}</p>
          </div>
        ))}
      </div>

      {/* Meet Our Team */}
      <h2 style={{ fontSize: "2.4rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        Meet Our Team
      </h2>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {teamMembers.map(({ name, role, image, description }) => (
          <div
            key={name}
            style={{
              width: "280px",
              height: "350px",
              cursor: "pointer",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <PixelTransition
              firstContent={
                <Image
                  src={image}
                  alt={`${name}`}
                  width={280}
                  height={350}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              }
              secondContent={
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#111",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.3rem" }}>
                    {name}
                  </h3>
                  <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>{role}</p>
                  <p style={{ fontSize: "0.9rem", color: "#ccc" }}>{description}</p>
                </div>
              }
              gridSize={12}
              pixelColor="#ffffff"
              animationStepDuration={0.4}
              className="custom-pixel-card"
            />
          </div>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
}
