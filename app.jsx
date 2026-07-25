const { useState, useEffect, useRef } = React;

const dummyMagazines = [
    {
        id: 1,
        title: "Let's Adjust and Stay Happy!",
        date: "June 2026",
        cover: "https://placehold.co/400x550/eeeeee/333333?text=June+2026",
        pdfUrl: "magazine.pdf" 
    },
    {
        id: 2,
        title: "The Magic of Reading",
        date: "May 2026",
        cover: "https://placehold.co/400x550/eeeeee/333333?text=May+2026",
        pdfUrl: "magazine.pdf"
    },
    {
        id: 3,
        title: "Meditation & Focus",
        date: "April 2026",
        cover: "https://placehold.co/400x550/eeeeee/333333?text=April+2026",
        pdfUrl: "magazine.pdf"
    }
];

function App() {
    const [selectedPdf, setSelectedPdf] = useState(null);

    // Initialize Lucide icons on every render
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    return (
        <div className="flex flex-col min-h-screen">
            <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
                <a href="#" className="flex items-center no-underline">
                    <img src="logo.png" alt="Gnan Mandir Logo" className="h-12 w-auto object-contain" />
                </a>
                <ul className="flex gap-12 list-none">
                    <li><a href="#" className="text-gray-900 font-light text-sm uppercase tracking-wider hover:opacity-50 transition-opacity">Home</a></li>
                    <li><a href="#" className="text-gray-900 font-light text-sm uppercase tracking-wider hover:opacity-50 transition-opacity">Latest Issue</a></li>
                    <li><a href="#" className="text-gray-900 font-light text-sm uppercase tracking-wider hover:opacity-50 transition-opacity">Archive</a></li>
                </ul>
            </nav>

            <main className="flex-1 p-12 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 pb-12">
                    {dummyMagazines.map(mag => (
                        <MagazineCard key={mag.id} magazine={mag} onRead={() => setSelectedPdf(mag.pdfUrl)} />
                    ))}
                </div>
            </main>

            {/* Modal Overlay */}
            <FlipbookModal pdfUrl={selectedPdf} onClose={() => setSelectedPdf(null)} />
        </div>
    );
}

function MagazineCard({ magazine, onRead }) {
    return (
        <div 
            onClick={onRead}
            className="group relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 aspect-[3/4] bg-gray-100"
        >
            <img 
                src={magazine.cover} 
                alt={magazine.title} 
                className="w-full h-full object-cover transition-all duration-300 group-hover:blur-sm group-hover:brightness-90"
            />
            
            <div className="absolute inset-0 bg-[#fdfaf5]/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-8 text-center">
                <img src={magazine.cover} alt="thumbnail" className="w-24 rounded shadow-md mb-4" />
                <h3 className="text-brand text-lg font-semibold leading-tight mb-2">{magazine.title}</h3>
                <p className="text-sm font-semibold mb-6">{magazine.date}</p>
                
                <div className="flex gap-3">
                    <button className="bg-brand text-white rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform" onClick={(e) => e.stopPropagation()}>
                        <i data-lucide="share-2" className="w-5 h-5"></i>
                    </button>
                    <button className="bg-brand text-white rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform" onClick={(e) => e.stopPropagation()}>
                        <i data-lucide="download" className="w-5 h-5"></i>
                    </button>
                    <button className="bg-brand text-white rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); onRead(); }}>
                        <i data-lucide="book-open" className="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

function FlipbookModal({ pdfUrl, onClose }) {
    const flipbookContainerRef = useRef(null);
    const [pageFlipInstance, setPageFlipInstance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    // We store the canvases in a ref so we can inject them into the DOM manually
    const canvasesRef = useRef([]);

    useEffect(() => {
        if (!pdfUrl) return;

        let isMounted = true;
        setLoading(true);
        setError(null);
        setTotalPages(0);
        setCurrentPage(1);

        const loadPDF = async () => {
            try {
                const pdfDoc = await window.pdfjsLib.getDocument(pdfUrl).promise;
                if (!isMounted) return;
                
                setTotalPages(pdfDoc.numPages);
                
                const firstPage = await pdfDoc.getPage(1);
                const viewport = firstPage.getViewport({ scale: 1.5 });
                
                const pageWidth = viewport.width;
                const pageHeight = viewport.height;

                const pagesHtml = [];

                for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                    const page = await pdfDoc.getPage(pageNum);
                    const pageViewport = page.getViewport({ scale: 1.5 });
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = pageViewport.width;
                    canvas.height = pageViewport.height;
                    
                    const context = canvas.getContext('2d');
                    await page.render({ canvasContext: context, viewport: pageViewport }).promise;
                    
                    const pageDiv = document.createElement('div');
                    pageDiv.className = 'page';
                    pageDiv.appendChild(canvas);
                    pagesHtml.push(pageDiv);
                }

                if (!isMounted) return;

                // Clear previous container content
                if (flipbookContainerRef.current) {
                    flipbookContainerRef.current.innerHTML = '';
                    pagesHtml.forEach(div => flipbookContainerRef.current.appendChild(div));
                }

                // Initialize StPageFlip
                const flip = new window.St.PageFlip(flipbookContainerRef.current, {
                    width: pageWidth,
                    height: pageHeight,
                    size: "fit",
                    minWidth: 315,
                    maxWidth: 800,
                    minHeight: 420,
                    maxHeight: 1000,
                    maxShadowOpacity: 0.3,
                    showCover: true,
                    mobileScrollSupport: false
                });

                flip.loadFromHTML(document.querySelectorAll('.page'));
                
                flip.on('flip', (e) => {
                    setCurrentPage(e.data + 1);
                });

                setPageFlipInstance(flip);
                setLoading(false);

            } catch (err) {
                if (isMounted) {
                    console.error("PDF Load Error:", err);
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        loadPDF();

        return () => {
            isMounted = false;
            if (pageFlipInstance) {
                pageFlipInstance.destroy();
            }
        };
    }, [pdfUrl]);

    // Re-run icons when modal opens
    useEffect(() => {
        if (pdfUrl && window.lucide) window.lucide.createIcons();
    }, [pdfUrl, loading]);

    if (!pdfUrl) return null;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1a1a1a] z-[1000] flex flex-col transition-opacity duration-300">
            <div className="flex justify-end p-4">
                <button onClick={onClose} className="text-white p-2 hover:text-gray-300 transition-colors">
                    <i data-lucide="x" className="w-6 h-6"></i>
                </button>
            </div>

            <div className="flex-1 flex items-center justify-between px-8 relative">
                <button 
                    onClick={() => pageFlipInstance && pageFlipInstance.flipPrev()}
                    className="bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/40 transition-colors z-10"
                >
                    <i data-lucide="chevron-left" className="w-7 h-7"></i>
                </button>

                <div className="flex-1 flex items-center justify-center h-full relative p-12">
                    {loading && <div className="absolute text-white text-xl tracking-widest">Loading Magazine...</div>}
                    {error && <div className="absolute text-red-400 text-center">Error Loading PDF: <br/>{error}</div>}
                    
                    <div 
                        ref={flipbookContainerRef} 
                        className={loading || error ? 'hidden' : 'block shadow-2xl'}
                    >
                    </div>
                </div>

                <button 
                    onClick={() => pageFlipInstance && pageFlipInstance.flipNext()}
                    className="bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/40 transition-colors z-10"
                >
                    <i data-lucide="chevron-right" className="w-7 h-7"></i>
                </button>
            </div>

            {!loading && !error && (
                <div className="bg-white px-8 py-3 flex justify-between items-center rounded-lg mx-auto w-[90%] max-w-4xl mb-4 shadow-lg">
                    <div className="flex items-center gap-6 text-gray-600">
                        <button className="hover:text-black transition-colors"><i data-lucide="share-2" className="w-5 h-5"></i></button>
                        <button className="hover:text-black transition-colors"><i data-lucide="download" className="w-5 h-5"></i></button>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button className="text-gray-600 hover:text-black" onClick={() => pageFlipInstance && pageFlipInstance.flipPrev()}>
                            <i data-lucide="chevron-left" className="w-5 h-5"></i>
                        </button>
                        <span className="text-sm font-medium bg-gray-100 px-4 py-1.5 rounded-full text-gray-800">
                            {currentPage} / {totalPages}
                        </span>
                        <button className="text-gray-600 hover:text-black" onClick={() => pageFlipInstance && pageFlipInstance.flipNext()}>
                            <i data-lucide="chevron-right" className="w-5 h-5"></i>
                        </button>
                    </div>

                    <div className="flex items-center gap-6 text-gray-600">
                        <button className="hover:text-black transition-colors"><i data-lucide="grid-3x3" className="w-5 h-5"></i></button>
                        <button className="hover:text-black transition-colors"><i data-lucide="zoom-in" className="w-5 h-5"></i></button>
                        <button className="hover:text-black transition-colors"><i data-lucide="zoom-out" className="w-5 h-5"></i></button>
                        <button className="hover:text-black transition-colors" onClick={toggleFullscreen}><i data-lucide="maximize" className="w-5 h-5"></i></button>
                        <button className="hover:text-black transition-colors"><i data-lucide="more-horizontal" className="w-5 h-5"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
