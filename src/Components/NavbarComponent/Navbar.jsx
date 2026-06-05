import './Styles/Navbar.css'
import { useState,useEffect } from 'react'
export default function Navbar() {
    const [NavbarActive, setNavbarActive] = useState(false)
    const [MenuActive, setMenuActive] = useState(false)
    const [LiActive, setLiActive] = useState(0)
    useEffect(() => {
        const HandleScroll = () => {
            if(window.scrollY > 30) {
                setNavbarActive(true)
            }else {
                setNavbarActive(false)
            }
        }
        window.addEventListener('scroll', HandleScroll)
        return ()=> window.removeEventListener('scroll', HandleScroll)
    },[])
    return (
        <>
        <section className={`navbarSection  ${NavbarActive ? 'Active' : ''}`}>
            <h1 className='logo'>DashHard</h1>
            <img src="https://img.icons8.com/?size=100&id=36389&format=png&color=ffffff" alt="Icon Menu" className={`iconMenu `} onClick={()=> setMenuActive(prev => !prev)}/>
        </section>
        <section className={`menu  ${MenuActive ? 'Active' : ''}`}>
            <ul>
                <li className={`${LiActive === 0 ? 'Active' : ''}`} onClick={()=> setLiActive(0)}>
                    <img src="https://img.icons8.com/?size=100&id=Yj5svDsC4jQA&format=png&color=973FFF" alt="Icon Dashboard" className={`${LiActive === 0 ? 'Active' : ''}`}/>
                    <p>Dashboard</p>
                </li>
                <li className={`${LiActive === 1 ? 'Active' : ''}`} onClick={()=> setLiActive(1)}>
                    <img src="https://img.icons8.com/?size=100&id=876&format=png&color=973FFF" alt="Icon Warning" className={`${LiActive === 1 ? 'Active' : ''}`}/>
                    <p>Warnings</p>
                </li>
                <li className={`${LiActive === 2 ? 'Active' : ''}`} onClick={()=> setLiActive(2)}>
                    <img src="https://img.icons8.com/?size=100&id=12598&format=png&color=973FFF" alt="Icon GitHub" className={`${LiActive === 2 ? 'Active' : ''}`}/>
                    <p>Github</p>
                </li>
                <li className={`${LiActive === 3 ? 'Active' : ''}`} onClick={()=> setLiActive(3)}>
                    <img src="https://img.icons8.com/?size=100&id=112702&format=png&color=973FFF" alt="Icon Files" className={`${LiActive === 3 ? 'Active' : ''}`}/>
                    <p>View Files</p>
                </li>
            </ul>
        </section>
        </>
    )
}