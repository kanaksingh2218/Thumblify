import { useLocation, useNavigate, useParams } from "react-router";
import { colorSchemes, type AspectRatio, type IThumbnail, type ThumbnailStyle } from "../assets/assets.ts";
import { useEffect, useState } from "react";
import SoftBackDrop from "../components/SoftBackDrop.tsx";
import AspectRatioSelector from "../components/AspectRatioSelector.tsx";
import StyleSelector from "../components/StyleSelector.tsx";
import ColorSchemeSelector from "../components/ColorSchemeSelector.tsx";
import PreviewPanel from "../components/PreviewPanel.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import toast from "react-hot-toast";
import api from "../configs/api.ts";


const Generate = () => {

    const {id} = useParams();
    const{pathname} = useLocation()
    const navigate = useNavigate()
    const {isLoggedIn}= useAuth()

    const [title, setTitle] = useState("");
    const [additionaldetails, setAdditionaldetails] = useState("");

    const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null);
    const [loading, setLoading] = useState(false);

    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
    const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id);
    const [style, setStyle] = useState<ThumbnailStyle>("Bold & Graphic");
    const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

    const handleGenerate = async () => {
        if (!isLoggedIn) return toast.error('Please login to generate thumbnails')
            if(!title.trim()) return toast.error('Title is required')
                setLoading(true)

        const api_payload = {
            title,
            prompt: additionaldetails,
            style,
            aspect_ratio: aspectRatio,
            color_scheme: colorSchemeId,
            text_overlay : true
        }

        try {
            const {data} = await api.post('/api/thumbnail/generate', api_payload)
            if(data.thumbnail){
                navigate(`/generate/${data.thumbnail._id}`);
                toast.success(data.message)
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message)
            setLoading(false)
        }
    }

    const fetchThumbnail = async () => {
        try {
            const {data} = await api.get(`/api/user/thumbnail/${id}`);
            setThumbnail(data?.thumbnail as IThumbnail);
            setLoading(!data?.thumbnail?.image_url);
            setAdditionaldetails(data?.thumbnail?.user_prompt);
            setTitle(data?.thumbnail?.title);
            setColorSchemeId(data?.thumbnail?.color_scheme);
            setAspectRatio(data?.thumbnail?.aspect_ratio);
            setStyle(data?.thumbnail?.style);
        } catch (error:any) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        if (isLoggedIn && id) {
            fetchThumbnail();
        }
        if (id && loading && isLoggedIn) {
            const interval = setInterval(()=>{
                fetchThumbnail()
            },5000)
            return ()=> clearInterval(interval)
        }
    }, [id, isLoggedIn, loading]);

    useEffect(()=>{
        if(!id){
            setThumbnail(null)
            setTitle("")
            setAdditionaldetails("")
            setAspectRatio("16:9")
            setColorSchemeId(colorSchemes[0].id)
            setStyle("Bold & Graphic")
        }
    }, [pathname])

  return (
    <>
    <SoftBackDrop/>
    <div className="pt-24 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
            <div className="grid lg:grid-cols-[400px_1fr] gap-8">
                {/*LEFT PANEL*/}
                <div className={`space-y-6 ${id && "pointer-events-none"}`}>
                    <div className="p-6 rounded-2xl bg-white/8 border border-white/ 12 shadow-xl space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100 mb-1">Create Your Thumbnail</h2>
                        <p className="text-sm text-zinc-400">Describe your vision and let AI bring it to life </p>
                    </div>
                    <div className="space-y-5">
                        {/*Title Input*/}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Title or Topic</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                maxLength={100}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 text-zinc-100 placeholder:text-zinc-400 border border-white/12 bg-black/20 focus:ring-2 focus:ring-pink-500 focus:outline-none rounded-lg"
                                placeholder="e.g. '10 Tips for Better Sleep'"
                            />
                            <div className="flex justify-end">
                                <span className="text-sm text-zinc-400">{title.length}/100</span>
                            </div>
                        </div>
                        {/*AspectRatioSelector*/}
                        <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                        {/*StyleSelector*/}
                        <StyleSelector value={style} onChange={setStyle} isOpen={styleDropdownOpen} setIsOpen={setStyleDropdownOpen}/>
                        {/*ColorSchemeSelector*/}
                        <ColorSchemeSelector value={colorSchemeId} onChange={setColorSchemeId}/>

                        {/*Details*/}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Additional Prompts
                                <span className="text-xs text-zinc-400"> (Optional) </span>
                            </label>
                            <textarea 
                                name="" 
                                id=""
                                value={additionaldetails}
                                onChange={(e) => setAdditionaldetails(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 text-zinc-100 placeholder:text-zinc-400 border border-white/10 bg-white/6 focus:ring-2 focus:ring-pink-500 focus:outline-none rounded-lg resize-none"
                                placeholder="Add any specific elements, mood, or style preferences..."
                            />
                        </div>
                    </div>
                    {/*Button */}
                    {!id && (
                        <button onClick={handleGenerate} className="text-[15px] w-full py-3.5 rounded-xl font-medium bg-linear-to-b from-pink-500 to-pink-600 hover:from-pink-700 disabled:cursor-not-allowed transition-colors">
                            {loading ? "Generating..." : "Generate Thumbnail"}
                        </button>
                    )}
                    </div>
                </div>
                {/*RIGHT PANEL*/}
                <div>
                    <div className="p-6 rounded-2xl bg-white/8 border border-white/10 shadow-xl">
                        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Preview</h2>
                        <PreviewPanel thumbnail={thumbnail} isLoading={loading} aspectRatio={aspectRatio} />
                    </div>
                </div>
            </div>
        </main>
    </div>
    </>
  )
}

export default Generate