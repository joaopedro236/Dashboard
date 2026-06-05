import './Styles/CardsMain.css'
import { useState, useEffect } from 'react'
function Card(props) {

    return (
        <>
            <div className="card">
                <p className='titleCard'>{props.titleCard}</p>
                <h1>{props.Value}</h1>
                <hr />
                <p className={`statusCard ${props.statusCard?.includes('+') ? 'Active' : ''}`}>{props.statusCard}</p>
            
            </div>
        </>
    )
}
export default function () {
    
    const ApiUrl = import.meta.env.VITE_API_URL;
    const [Values, setValues] = useState({ CPUValue: 0, CpuStatus: '', CPUAverageValue: 0, CpuAverageStatus: '', RAMValue: 0, RamStatus: '', RAMAverageValue: 0, RamAverageStatus: '', DISKValue: 0, DISKStatus: '', DISKAverageValue: 0, DISKAverageStatus: '' })
    useEffect(() => {
        const Fetch = async () => {
            try {
                const Response = await fetch(`${ApiUrl}/metrics`)
                const Data = await Response.json()
                setValues({ CPUValue: Data.cpu.current, CpuStatus: Data.cpu.change, CPUAverageValue: Data.cpu.average, CpuAverageStatus: Data.cpu.change, RAMValue: Data.ram.current, RamStatus: Data.ram.change, RAMAverageValue: Data.ram.average, RamAverageStatus: Data.ram.change, DISKValue: Data.disk.current, DISKStatus: Data.disk.change, DISKAverageValue: Data.disk.average, DISKAverageStatus: Data.disk.change })

            } catch (error) {
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
            <section className="CardsMainSection">
                <header>
                    <h1 className='title___CardsMain'>Dashboard</h1>
                    <div className="icons">
                        <img src="https://img.icons8.com/?size=100&id=364&format=png&color=ffffff" alt="Icon Config" className='iconConfig icon' />
                        <img src="https://img.icons8.com/?size=100&id=82779&format=png&color=ffffff" alt="Icon bell" className='iconBell icon' />
                    </div>
                </header>
                <div className="cards">
                    <Card titleCard='CPU Value' Value={Values.CPUValue} statusCard={Values.CpuStatus} />
                    <Card titleCard='CPU Average' Value={Values.CPUAverageValue} statusCard={Values.CpuAverageStatus} />
                    <Card titleCard='Ram Value' Value={Values.RAMValue} statusCard={Values.RamStatus} />
                    <Card titleCard='Ram Average ' Value={Values.RAMAverageValue} statusCard={Values.RamAverageStatus} />
                </div>
            </section>
        </>
    )
}