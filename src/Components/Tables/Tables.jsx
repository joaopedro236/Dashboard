import './Styles/Tables.css'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from 'react';

export default function Tables() {
    const [value, setValue] = useState(null)
    const ApiUrl = import.meta.env.VITE_API_URL;
    const [DownloadOrUpload, setDownloadOrUpload] = useState('Download')
    const [btn, setbtn] = useState(false)
    useEffect(() => {
        const Fetch = async () => {
            try {
                const Response = await fetch(`${ApiUrl}/metrics`)
                const Data = await Response.json()
                setValue(Data)

            }
            catch (error) {
                console.error(error.message)
            }
        }
        Fetch()
        const interval = setInterval(() => {
            Fetch()
        }, 3000);
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <section className="tableSection">
                <div className="table">
                    <header>
                        <h1 className='titleTable'>{btn ? 'Download' : 'Upload'} view</h1>
                        <button className={`btnTable`} onClick={() => {
                            setbtn(prev => !prev)
                            setDownloadOrUpload(prev => prev === 'Download' ? 'Upload' : 'Download')
                        }}>
                            {btn ? 'Download' : 'Upload'}
                        </button>
                    </header>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={value?.network?.[DownloadOrUpload]?.history || []}>
                            <CartesianGrid stroke='var(--grey)' strokeDasharray='5 5' vertical={false} />
                            <XAxis dataKey='index' fontSize={12} />
                            <YAxis fontSize={12} width={35} domain={[0, 'auto']}
                                allowDecimals={true}
                                tickFormatter={(value) => String(value).slice(0, 4)} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#13131376",
                                    backdropFilter: 'blur(4px)',
                                    color: "#fff",
                                    textAlign: "center",
                                    border: "none",
                                    borderRadius: "6px"
                                }}

                                labelStyle={{ display: "none" }}
                            />
                            <Line type={'monotoneX'} dataKey='value' stroke='var(--table-color)' isAnimationActive={true}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </>

    )
}