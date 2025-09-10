import { useEffect } from "react";
import Container from "../components/Container";
export default function Resume() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "";
  const name = params.get("name") || "";

  useEffect(() => {
    if (window.location.search.includes("?code=")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  //fake data
  const response = [
    {
      name: "Julia",
      interests: [
        "Art",
        "Painting",
        "Travel",
        "Photography",
        "Music",
        "Yoga",
        "Cooking",
      ],
    },
    {
      name: "Michael",
      interests: [
        "Technology",
        "Gaming",
        "Basketball",
        "Movies",
        "Hiking",
        "Robotics",
        "Reading",
      ],
    },
    {
      name: "Sara",
      interests: [
        "Writing",
        "Poetry",
        "Dancing",
        "Fashion",
        "Design",
        "Languages",
        "Volunteering",
      ],
    },
    {
      name: "Michael",
      interests: ["Technology", "Robotics", "Reading"],
    },
    {
      name: "Julia",
      interests: [
        "Art",
        "Painting",
        "Travel",
        "Photography",
        "Music",
        "Yoga",
        "Cooking",
      ],
    },
  ];

  console.log(code, name);
  return (
    <Container>
      <div className="flex flex-col w-full gap-y-4">
        <h1>Answers:</h1>
        {response
          .filter((res) => res.name !== name)
          .map((res, index) => (
            <div
              key={index}
              className="bg-[var(--color-dark)] border border-[var(--color-light)] rounded-md p-2"
            >
              <div className="flex flex-wrap gap-2">
                <div className="text-2xl md:text-lg text-[var(--color-primary)]">
                  {res.name}:
                </div>
                {res.interests.map((interest, i) => (
                  <p key={i}>
                    {interest}
                    {i < res.interests.length - 1 && ","}
                  </p>
                ))}
              </div>
            </div>
          ))}
      </div>
    </Container>
  );
}
