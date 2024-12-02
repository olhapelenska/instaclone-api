import bcrypt from "bcryptjs";

export default [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_name: "alice",
    email: "alice@example.com",
    password: await bcrypt.hash("password123", 10),
    profile_picture: "/uploads/alice-profile.jpg",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    user_name: "bob",
    email: "bob@example.com",
    password: await bcrypt.hash("password456", 10),
    profile_picture: "/uploads/bob-profile.jpg",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    user_name: "charlie",
    email: "charlie@example.com",
    password: await bcrypt.hash("password789", 10),
    profile_picture: "/uploads/charlie-profile.jpg",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    user_name: "diana",
    email: "diana@example.com",
    password: await bcrypt.hash("password000", 10),
    profile_picture: "/uploads/diana-profile.jpg",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    user_name: "edward",
    email: "edward@example.com",
    password: await bcrypt.hash("password111", 10),
    profile_picture: "/uploads/edward-profile.jpg",
  },
];
