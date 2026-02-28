exports.submitContact = (req, res) => {
    const { name, email, message } = req.body;
    console.log("Contact Request:", name, email, message);
    res.status(200).json({ status: "success", message: "Thanks for contacting us" });
};
