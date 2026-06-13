import './Styles/CardsMain.css'
import { useState } from 'react'
function Card(props) {

    return (
        <>
            <div className={`card `}>
                <p className='titleCard'>{props.titleCard}</p>
                <h1 className='valueCard'>{props.Value}</h1>
                <hr />
                <p className={`statusCard ${props.statusCard?.includes('+') ? 'Active' : ''}`}>{props.statusCard}</p>

            </div>
        </>
    )
}
export default function CardsMain({ ui, setUi, isOpen, Data }) {
    const toggleMenuConfig = () => {
        setUi(prev => ({
            ...prev,

            isOpen: !prev.isOpen
        }));
    };
    
    const [iconsActive, setIconsActive] = useState({ iconConfig: false, iconBell: false })
    
    if (!Data) {
        return <div>Loading...</div>
    }
    return (
        <>
            <section className="CardsMainSection">
                <header>
                    <h1 translate='no' className='title___CardsMain'>Dashboard</h1>
                    <div className="icons">
                        <img src="https://img.icons8.com/?size=100&id=364&format=png&color=ffffff" alt="Icon Config" className={`iconConfig ${iconsActive.iconConfig ? 'Active' : ''} icon`} onClick={() => {
                            toggleMenuConfig()
                            setIconsActive(prev => ({ ...prev, iconConfig: !prev.iconConfig }))
                        }} />
                        <img src="https://img.icons8.com/?size=100&id=82779&format=png&color=ffffff" alt="Icon bell" className={`iconBell icon ${iconsActive.iconBell ? 'Active' : ''}`} onClick={() => {
                            setIconsActive(prev => ({ ...prev, iconBell: !prev.iconBell }))
                        }} />
                    </div>
                </header>
                <div className="cards">
                    <Card titleCard='CPU Value' Value={Data.cpu.current} statusCard={Data.cpu.change} />
                    <Card titleCard='CPU Average' Value={Data.cpu.average} statusCard={Data.cpu.change} />
                    <Card titleCard='RAM Value' Value={Data.ram.current} statusCard={Data.ram.change} />
                    <Card titleCard='RAM Average ' Value={Data.ram.average} statusCard={Data.ram.change} />
                    <Card titleCard='Disk Value' Value={Data.disk.current} statusCard={Data.disk.change}/>
                    <Card titleCard='Disk Average ' Value={Data.disk.average} statusCard={Data.disk.change}/>
                </div>
            </section>
        </>
    )

}