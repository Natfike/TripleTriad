import { useEffect, useState } from "react";
import axios from "axios";

function DailyPull(){

    const token = localStorage.getItem('token');
    const [dailyPullData, setDailyPullData] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!token) {
            return;
        }

        try {
            axios.post(`${API_URL}/api/users/dailyPull`, {
                cardGroup: "FFVIII"
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setDailyPullData(response.data.cards);
                })
        } catch (error) {
            console.error(error);
        }
    }, [token]);

    return (
        <>
        </>
    )
}

export default DailyPull;