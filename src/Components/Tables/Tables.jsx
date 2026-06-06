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
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={value?.network?.download?.history || []}>
                            <CartesianGrid stroke='var(--grey)' strokeDasharray='5 5' vertical={false} />
                            <XAxis dataKey='index' fontSize={12} />
                            <YAxis fontSize={12} width={35} domain={[0, 'auto']}
                                allowDecimals={true}
                                tickFormatter={(value) => String(value).slice(0, 4)} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1f1f1f55",
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