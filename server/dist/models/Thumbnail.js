import mongoose from "mongoose";
const ThumbnailSchema = new mongoose.Schema({
    userId: { type: String, ref: "User", required: true },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    style: { type: String, enum: ["Bold & Graphic", "Tech/Futuristic", "Minimalist", "Photorealistic", "Illustrated"], required: true },
    aspect_ratio: { type: String, enum: ["16:9", "1:1", "9:16"], default: "16:9" },
    color_scheme: { type: String, enum: ["vibrant", "sunset", "forest", "neon", "purple", "monochrome", "ocean", "pastel"] },
    text_overlay: { type: Boolean, default: false },
    image_url: { type: String, default: "" },
    prompt_used: { type: String, },
    user_prompt: { type: String, },
    isGenerating: { type: Boolean, default: true }
});
const Thumbnail = mongoose.models.Thumbnail || mongoose.model("Thumbnail", ThumbnailSchema);
export default Thumbnail;
