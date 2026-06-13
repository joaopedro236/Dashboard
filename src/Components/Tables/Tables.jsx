import './Styles/Tables.css'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,

    Area,
    ResponsiveContainer,
    ReferenceLine,
    AreaChart
} from "recharts";

import { useState, useEffect } from 'react';

export default function Tables() {
    const [value, setValue] = useState(null)
    const ApiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const Fetch = async () => {
            try {
                const Response = await fetch(`${ApiUrl}/metrics`)
                if (!Response.ok) {
                    throw new Error(`HTTP ${Response.status}: ${Response.statusText}`);
                }
                const Data = await Response.json()

                setValue(Data)

            }
            catch (error) {
                console.error(error)
            }
        }
        Fetch()
        const interval = setInterval(() => {
            Fetch()
        }, 5000);
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <section className="tableSection">
                <div className="table">
                    <header>
                        <h1 className='titleTable'>Download / Upload view</h1>

                    </header>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={value?.network?.DownloadOrUpload?.history || []}>
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
                                    textAlign: 'center',
                                    border: "none",
                                    borderRadius: "10px"
                                }}
                                formatter={(value, name) => [
                                    `${value} Mbps`,
                                    name === "value" ? "Download" : "Upload"
                                ]}
                                labelStyle={{ display: "none" }}
                            />
                            <Line type={'monotoneX'} dataKey='value' stroke='var(--table-color)' isAnimationActive={true}
                                animationDuration={1500}
                                className='line'
                                animationEasing="ease-out"
                            />
                            <Line
                                type={'monotoneX'} dataKey='valueUpload' stroke='var(--table-color-upload)' isAnimationActive={true}
                                animationDuration={1500}
                                className='line'
                                animationEasing="ease-out"
                            />

                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="table">
                    <header>
                        <h1 className="titleTable">Ping View</h1>
                    </header>
                    <ResponsiveContainer width='100%' height={304.5}>
                        <AreaChart
                            data={value?.network.ping?.history || []}
                            margin={{
                                top: 20,
                                right: 0,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <XAxis dataKey='index' fontSize={12} />
                            <YAxis width='auto' fontSize={12} width={35} domain={[0, 'auto']} allowDecimals={true} tickFormatter={(value) => String(value).slice(0, 4)} />
                            <CartesianGrid strokeDasharray='3 3' stroke='var(--grey)' />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#13131376",
                                    backdropFilter: 'blur(4px)',
                                    color: "#fff",
                                    textAlign: "center",
                                    border: "none",
                                    borderRadius: "10px"
                                }}
                                formatter={(value) => [`Ping: ${value} Ms`]}
                                labelStyle={{ display: "none" }}
                            />
                            <ReferenceLine x='value' stroke='var(--table-color)' />
                            <ReferenceLine y={4000} stroke='var(--table-color)' strokeDasharray='3 3' />
                            <Area type="monotone" dataKey='value' stroke='var(--table-color)' fill='var(--table-fill)' />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </>

    )
}