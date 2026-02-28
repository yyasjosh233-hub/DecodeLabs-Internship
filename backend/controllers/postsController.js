const posts = [
    {
        id: 1,
        title: "Underwater Robots",
        date: "February 24, 2026",
        image: "assets/underwater_robot.png",
        body: "Underwater robots, also known as remotely operated vehicles (ROVs) or autonomous underwater vehicles (AUVs), play a crucial role in ocean exploration, underwater mining, and pipeline inspections. These advanced systems are equipped with high-resolution cameras and sensors to navigate the deep sea with precision."
    },
    {
        id: 2,
        title: "Educational Robots",
        date: "February 24, 2026",
        image: "assets/educational_robot.png",
        body: "Educational robots are specifically designed to facilitate learning in the fields of coding and robotics. These innovative tools provide hands-on experience and inspire the next generation of engineers by making complex STEM concepts accessible and engaging for students of all ages."
    },
    {
        id: 3,
        title: "Agricultural Robots",
        date: "February 24, 2026",
        image: "assets/agricultural_robot.png",
        body: "Agricultural robots are designed to enhance various aspects of farming, including planting seeds with precision, ensuring optimal watering, and monitoring crop health through advanced AI sensors. These systems help farmers increase yield while reducing the use of resources like water and pesticides."
    },
    {
        id: 4,
        title: "Medical Robots",
        date: "February 24, 2026",
        image: "assets/medical_robot.png",
        body: "Medical robots play a crucial role in enhancing the precision and efficiency of surgical procedures, significantly reducing recovery times and improving patient outcomes. From robotic-assisted surgery to rehabilitation exoskeletons, these technologies are redefining healthcare."
    },
    {
        id: 5,
        title: "Humanoid Robots",
        date: "February 24, 2026",
        image: "https://via.placeholder.com/600x400?text=Humanoid+Robot",
        body: "Humanoid robots are advanced machines engineered to both look and act like humans. These innovative robots typically feature a human-like structure and are used for service roles, research, and interaction in environments designed for humans, pushing the boundaries of AI and mechanics."
    },
    {
        id: 6,
        title: "Industrial Robots",
        date: "February 24, 2026",
        image: "https://via.placeholder.com/600x400?text=Industrial+Robot",
        body: "Utilized in various manufacturing processes such as welding, painting, assembling, and packaging to enhance efficiency and productivity. Industrial robots are the backbone of modern manufacturing, providing high-speed precision and safety in challenging environments."
    }
];

exports.getAllPosts = (req, res) => {
    res.json(posts);
};
