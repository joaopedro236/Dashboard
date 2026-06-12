import './Styles/Infrastructure.css'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip
} from 'recharts';
import { useState, useEffect } from 'react';
export default function Infrastructure({ Data }) {
    const parsePercent = (value) =>
        Number(String(value).replace('%', '')) || 0;
    const COLORS = ['var(--infrastructure-background-type-one)', 'var(--infrastructure-background-type-two)', 'var(--infrastructure-background-type-three)', 'var(--infrastructure-background-type-four)'];
    const chartData = [
        { name: 'CPU', value: parsePercent(Data?.cpu?.current) },
        { name: 'RAM', value: parsePercent(Data?.ram?.current) },
        { name: 'Disk', value: parsePercent(Data?.disk?.current) },
        { name: 'Network', value: parsePercent(Data?.network?.DownloadOrUpload?.current) }
    ];
    if (!Data) {
        return <div>Loading...</div>
    }
    const hasWarnings = cpuHigh || ramHigh || diskHigh;
    const [valueHigh, setValueHigh] = useState({ cpuHigh: false, cpuWarning: 0, ramHigh: false, ramWarning: 0, diskHigh: false, diskWarning: 0 })
    const cpuHigh = chartData[0]?.value > 70
    const ramHigh = chartData[1]?.value > 70
    const diskHigh = chartData[2]?.value > 70
    useEffect(() => {

        if (cpuHigh && !valueHigh.cpuHigh) {
            setValueHigh(prev => ({
                ...prev,
                cpuHigh: true,
                cpuWarning: prev.cpuWarning + 1

            }))
        }
        if (!cpuHigh && valueHigh.cpuHigh) {
            setValueHigh(prev => ({
                ...prev,
                cpuHigh: false
            }));
        }
        if (ramHigh && !valueHigh.ramHigh) {
            setValueHigh(prev => ({
                ...prev,
                ramHigh: true,
                ramWarning: prev.ramWarning + 1
            }))
        }
        if (!ramHigh && valueHigh.ramHigh) {
            setValueHigh(prev => ({
                ...prev,
                ramHigh: false
            }));
        }
        if (diskHigh && !valueHigh.diskHigh) {
            setValueHigh(prev => ({
                ...prev,
                diskHigh: true,
                diskWarning: prev.diskWarning + 1
            }))
        }
        if (!diskHigh && valueHigh.diskHigh) {
            setValueHigh(prev => ({
                ...prev,
                diskHigh: false
            }));
        }
    }, [cpuHigh, ramHigh, diskHigh])
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
                            <li className='text__typeOne'>CPU: {Data.cpu.current}</li>
                            <li className='text__typeTwo'>RAM: {Data.ram.current}</li>
                            <li className='text__typeThree'>Disk: {Data.disk.current}</li>
                            <li className='text__typeFour'>Network: {Data.network.DownloadOrUpload.current}</li>
                        </ul>
                    </div>
                </div>
                <div className="warnings">
                    <header>
                        <h1>Warnings</h1>
                    </header>
                    <div className={`noWarning ${hasWarnings ? 'Active' : ''}`}>
                        <p>No Warning</p>
                    </div>
                    <div className={`CpuWarning warningContent ${valueHigh.cpuHigh ? 'Active' : ''}`}>
                        <p className='valueTextWarning'>CPU usage above 70%</p>

                        <p className='notificationWarning'>{valueHigh.cpuWarning}</p>
                    </div>
                    <div className={`RamWarning warningContent ${valueHigh.ramHigh ? 'Active' : ''}`}>
                        <p className='valueTextWarning'>RAM usage above 70%</p>
                        <p className='notificationWarning'>{valueHigh.ramWarning}</p>
                    </div>
                    <div className={`DiskWarning warningContent ${valueHigh.diskHigh ? 'Active' : ''}`}>
                        <p className='valueTextWarning'>Disk usage above 70%</p>
                        <p className='notificationWarning'>{valueHigh.diskWarning}</p>
                    </div>
                </div>
            </section>
        </>
    )
}