import './Styles/Navbar.css'
import { MenuItems } from '../../Data/MenuItem'
import { useState, useEffect } from 'react'
export default function Navbar({ hidden }) {
    const [NavbarActive, setNavbarActive] = useState(false)
    const [MenuActive, setMenuActive] = useState(false)
    const [LiActive, setLiActive] = useState(0)
    useEffect(() => {
        const HandleScroll = () => {
            if (window.scrollY > 30) {
                setNavbarActive(true)
            } else {
                setNavbarActive(false)
            }
        }
        window.addEventListener('scroll', HandleScroll)
        return () => window.removeEventListener('scroll', HandleScroll)
    }, [])
    return (
        <>
            <section className={`navbarSection ${hidden ? "Hidden" : NavbarActive ? "Active" : ""}`}>
                <h1 className='logo' translate='no'>DashHard</h1>
                <img src="https://img.icons8.com/?size=100&id=36389&format=png&color=ffffff" alt="Icon Menu" className={`iconMenu `} onClick={() => setMenuActive(prev => !prev)} />
            </section >
            <section className={`menu  ${MenuActive ? 'Active' : ''}`}>
                <button className='closeMenu' onClick={() => setMenuActive(false)}>X</button>
                <ul>
                    {
                        MenuItems.map((MenuItemsMap, index) => (
                            <li key={index} className={`${LiActive === index ? 'Active' : ''}`} onClick={() => setLiActive(index)}>
                                <img src={MenuItemsMap.icon} alt="Icons" className={`${LiActive === index ? 'Active' : ''}`} />
                                <p className={`${LiActive === index ? 'Active' : ''}`}>{MenuItemsMap.title}</p>
                            </li>
                        ))
                    }

                </ul>
            </section>
        </>
    )
}