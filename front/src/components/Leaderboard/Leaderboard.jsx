import styles from './Leaderboard.module.scss';
import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    const getLeaderboard = async () => {
        const response = await fetch('http://localhost:5001/v1/game/leaderboard');
        const data = await response.json();
        if (data.leaderboard) {
            setLeaderboard(data.leaderboard);
        }
    }

    useEffect(() => {
        getLeaderboard();
    }, []);

    return (
        <div className={styles.leaderboard}>
            <h1>Leaderboard</h1>
            {
                leaderboard.length > 0 && leaderboard.map((user, index) => {
                    return (
                        <div key={index} className="leaderboard__user">
                            <table>
                                <thead>
                                    <tr>
                                        <th># 👑</th>
                                        <th>Pseudo</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>{user.user_pseudo}</td>
                                        <td>{user.score}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )
                })
            }
        </div>
    );
}

export default Leaderboard;