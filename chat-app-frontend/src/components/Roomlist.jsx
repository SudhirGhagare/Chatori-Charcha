import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import chatIcon from '../assets/logo.png';
import { getRooms } from '../services/RoomService';
import toast from 'react-hot-toast';
import bg from '../assets/button_background1.png';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadRooms = async () => {
            try {
                const response = await getRooms();
                setRooms(response.rooms);
            } catch (error) {
                console.log(error);
                toast.error("Server Side Error");
            }
        };
        loadRooms();
    }, []);

    const filteredRooms = rooms.filter(room =>
        room.roomId.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    // 👇 Handle Join Room Click
    const handleJoinRoom = async (roomId) => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("Room ID copied to clipboard!");
            setTimeout(() => {
                navigate(`/`); // Replace with your target route
            }, 600);
        } catch (err) {
            toast.error("Failed to copy Room ID");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#FDF9F3]">
            <div className="p-8 border border-[#E48C52] w-full max-w-4xl rounded bg-white shadow flex flex-col gap-6">
                <div className="flex justify-center">
                    <img src={chatIcon} className="w-26 h-20" alt="Chat Logo" />
                </div>
                <h1 className="text-3xl text-[#845D1C] font-bold text-center">Available Topics</h1>
                <p className="text-center text-[#E48C52]">
                    Jump into a group and start your bakbak session now! 😄 Whether you’re in the mood for memes, music, or motivation – there’s a group waiting for you!
                </p>

                <input
                    type="text"
                    placeholder="Search Room ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border rounded bg-white text-[#845D1C] border-2 border-[#845D1C] caret-[#E48C52] focus:outline-none"
                />

                <div className="overflow-y-auto max-h-64 border dark:border-gray-700 rounded">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="sticky top-0  bg-[#E48C52] z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-white uppercase tracking-wider">Sr. no</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-white uppercase tracking-wider">Room name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-white uppercase tracking-wider">Room ID</th>

                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map((room, index) => (
                                    <tr key={room.roomId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#845D1C]">
                                            {index + 1}
                                        </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#845D1C]">
                                            {room.groupName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#845D1C]">
                                            {room.roomId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <button
                                                onClick={() => handleJoinRoom(room.roomId)}
                                                className="inline-block px-4 py-2 text-white rounded shadow"
                                               style={{
                                                                backgroundImage: `url(${bg})`,
                                                                backgroundSize: 'cover',
                                                                backgroundRepeat: 'no-repeat',
                                                      }}
                                            >
                                                Copy Room Id
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-4 text-[#845D1C]">
                                        No rooms found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoomList;
