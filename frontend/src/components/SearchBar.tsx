import { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

interface SearchResult {
    id: string;
    name: string;
    artist: string;
    popularity: number;
    album?: string;
    image?: string;
}

interface SearchBarProps {
    onSelectSong: (song: SearchResult) => void;
}

const SearchBar = ({ onSelectSong }: SearchBarProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(
                `https://8b5af84a5bf3.ngrok-free.app/search?q=${encodeURIComponent(searchQuery)}`,
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) throw new Error("Erro na busca");

            const data = await response.json();
            setResults(data.results || []);
            setIsOpen(true);
        } catch (err) {
            console.error(err);
            setError("Erro ao buscar músicas");
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        handleSearch(value);
    };

    const handleSelectSong = (song: SearchResult) => {
        onSelectSong(song);
        setQuery("");
        setResults([]);
        setIsOpen(false);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        setError("");
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaSearch size={18} />
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Selecione uma música..."
                    className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                />

                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {isLoading && (
                        <div className="p-4 text-center text-gray-500">
                            Buscando...
                        </div>
                    )}

                    {error && (
                        <div className="p-4 text-center text-red-500">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && results.length === 0 && query.length >= 2 && (
                        <div className="p-4 text-center text-gray-500">
                            Sem resultados
                        </div>
                    )}

                    {!isLoading && results.length > 0 && (
                        <ul className="divide-y divide-gray-100">
                            {results.map((song) => (
                                <li
                                    key={song.id}
                                    onClick={() => handleSelectSong(song)}
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {song.image && (
                                            <img
                                                src={song.image}
                                                alt={song.name}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">
                                                {song.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 truncate">
                                                {song.artist}
                                                {song.album && ` • ${song.album}`}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {song.popularity}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Overlay to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default SearchBar;