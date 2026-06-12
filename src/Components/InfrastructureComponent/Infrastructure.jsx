import './Styles/Infrastructure.css'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip
} from 'recharts';
import { useState, useEffect } from 'react';
export default function Infrastructure({ Data }) {
    const parsePercent = (value) => {
        if (value == null) return 0;

        const num = Number(String(value).replace('%', '').trim());

        return Number.isFinite(num) ? num : 0;
    };
    const COLORS = ['var(--infrastructure-background-type-one)', 'var(--infrastructure-background-type-two)', 'var(--infrastructure-background-type-three)', 'var(--infrastructure-background-type-four)'];
    const chartData = [
        { name: 'CPU', value: parsePercent(Data?.cpu?.current) },
        { name: 'RAM', value: parsePercent(Data?.ram?.current) },
        { name: 'Disk', value: parsePercent(Data?.disk?.current) },
        { name: 'Network', value: parsePercent(Data?.network?.DownloadOrUpload?.current) }
    ];
    const [valueHigh, setValueHigh] = useState({ cpuHigh: false, cpuWarning: 0, ramHigh: false, ramWarning: 0, diskHigh: false, diskWarning: 0 })

    const cpuHigh = chartData[0]?.value > 70
    const ramHigh = chartData[1]?.value > 70
    const diskHigh = chartData[2]?.value > 70
    const hasWarnings = Boolean(
        cpuHigh || ramHigh || diskHigh
    );
    useEffect(() => {
        setValueHigh(prev => ({
            ...prev,
            cpuWarning: cpuHigh ? prev.cpuWarning + 1 : prev.cpuWarning,
            ramWarning: ramHigh ? prev.ramWarning + 1 : prev.ramWarning,
            diskWarning: diskHigh ? prev.diskWarning + 1 : prev.diskWarning,
        }));
    }, [Data, cpuHigh, ramHigh, diskHigh])
    if (!Data) {
        return <div>Loading...</div>
    }
    return (
        <>
            <section className="infrastructureSection">
                <div className="resourcesUsage">
                    <header>
                        <h1>Resources Usage</h1>
                    </header>
                    <div className="resourcesUsageContent">

                        <PieChart
                            style={{ width: '100%', maxWidth: '200px', maxHeight: '80vh', aspectRatio: 1 }}

                        >
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="80%"
                                fill="#8884d8"
                                dataKey="value"

                            >
                                {
                                    chartData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index]} />
                                    ))
                                }
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#0e0f0fa1",
                                    backdropFilter: 'blur(4px)',

                                    color: "#fff",
                                    textAlign: "center",
                                    border: "none",
                                    borderRadius: "10px"
                                }}
                            />
                        </PieChart>
                        <ul>
                            <li className='text__typeOne'>CPU: {Data?.cpu?.current}</li>
                            <li className='text__typeTwo'>RAM: {Data?.ram?.current}</li>
                            <li className='text__typeThree'>Disk: {Data?.disk?.current}</li>
                            <li className='text__typeFour'>Network: {Data?.network?.DownloadOrUpload?.current}</li>
                        </ul>
                    </div>
                </div>
                <div className="warnings">
                    <header>
                        <h1>Warnings</h1>
                    </header>


                    {cpuHigh && (
                        <div className={`CpuWarning warningContent ${valueHigh.cpuHigh ? 'Active' : ''}`}>
                            <p className='valueTextWarning'>CPU usage above 70%</p>

                            <p className='notificationWarning'>{valueHigh.cpuWarning}</p>
                        </div>
                    )}
                    {ramHigh && (
                        <div className={`RamWarning warningContent ${valueHigh.ramHigh ? 'Active' : ''}`}>
                            <p className='valueTextWarning'>RAM usage above 70%</p>
                            <p className='notificationWarning'>{valueHigh.ramWarning}</p>
                        </div>
                    )}
                    {diskHigh && (
                        <div className={`DiskWarning warningContent ${valueHigh.diskHigh ? 'Active' : ''}`}>
                            <p className='valueTextWarning'>Disk usage above 70%</p>
                            <p className='notificationWarning'>{valueHigh.diskWarning}</p>
                        </div>
                    )}
                    {!cpuHigh && !ramHigh && !diskHigh && (
                        <div className="noWarning">
                            <p>No Warning</p>
                        </div>
                    )}


                </div>
            </section>
        </>
    )
}