import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import LenisScroll from "./components/LenisScroll";
import Generate from "./pages/Generate";
import YtPreview from "./pages/YtPreview";
import Login from "./components/Login";
import MyGenerations from "./pages/MyGenerations";
import { useEffect } from "react";
import {Toaster} from 'react-hot-toast'

export default function App() {

    useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    return (
        <>
            <Toaster/>
            <LenisScroll />
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/generate" element={<Generate />} />
                <Route path="/generate/:id" element={<Generate />} />
                <Route path="/my-generation" element={<MyGenerations />} />
                <Route path="/preview" element={<YtPreview />} />
                <Route path="/login" element={<Login />} />
            </Routes>
            <Footer />
        </>
    );
}