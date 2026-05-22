import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from '@google/genai';
import ai from '../configs/ai.js';
import path from 'node:path';
import fs from 'fs';
import os from 'os';
import { v2 as cloudinary } from 'cloudinary'

const stylePrompts = {
    "Bold & Graphic": "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reactions, dramatic lighting, high contrast, click-worthy composition, professional style",
    "Tech/Futuristic": "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech asthetics, sharp lighting, high-tech atmosphere",
    "Minimalist": "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
    "Photorealistic": "photorealistic thumbnail, ultra-realistic-lighting, natural skin tones, candid moments, DSLR-style photography, lifestlye realism, shallow depth of field",
    "Illustrated": "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
}

const colorSchemeDescriptions = {
    vibrant: "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
    sunset: "warm sunset tone, orange pink and purple hues, soft gradients, cinematic glow",
    forest: "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
    neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
    purple: "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
    monochrome: "black and white color schema, high contrast, dramatic lighting, timeless aesthetics",
    ocean: "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
    pastel: "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
}

export const generateThumbnail = async (req: Request, res: Response) => {

    try {
        console.log(req.body);
        const { userId } = req.session;
        const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;

        const thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true
        })

        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;

        if (color_scheme) {
            prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme `
        }

        if (user_prompt) {
            prompt += `Additional details: ${user_prompt}. `
        }
        prompt += `The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`

        // Generate the image using a free alternative API (Pollinations.ai)
        // because Gemini Imagen requires a paid tier.
        const width = aspect_ratio === '16:9' ? 1280 : (aspect_ratio === '9:16' ? 720 : 1080);
        const height = aspect_ratio === '16:9' ? 720 : (aspect_ratio === '9:16' ? 1280 : 1080);
        
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;
        
        console.log("Generating with Pollinations.ai:", url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to generate image from free API');
        }

        const arrayBuffer = await response.arrayBuffer();
        const finalBuffer = Buffer.from(arrayBuffer);
        const fileName = `final-output-${Date.now()}.png`;
        const filePath = path.join(os.tmpdir(), fileName);

        //write the final image to the file
        fs.writeFileSync(filePath, finalBuffer!);

        try {
            const uploadResult = await cloudinary.uploader.upload
                (filePath, { resource_type: 'image' })

            thumbnail.image_url = uploadResult.secure_url;
            thumbnail.isGenerating = false;
            await thumbnail.save()

            res.json({ message: "Thumbnail Generated", thumbnail })
        } finally {
            //remove image file from disk even if upload fails
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        }



    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// controllers for thumbnail deletion

export const deleteThumbnail = async (req: Request, res: Response) => {

    try {
        const { id } = req.params;
        const { userId } = req.session;

        await Thumbnail.findOneAndDelete({ _id: id, userId })

        res.json({ message: "Thumbnail deleted sucessfully" });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}
