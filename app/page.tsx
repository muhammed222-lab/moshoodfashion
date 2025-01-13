import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>Welcome to Moshood Fashion Home</h1>
      <Image
        src="/mfh.jpg"
        alt="Moshood Fashion Home"
        width={1280}
        height={720}
      />
    </div>
  );
}
