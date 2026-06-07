import './Styles/SideBar.css'
import { useState } from 'react'
import {MenuItems} from '../../Data/MenuItem'
export default function SideBar({ hidden }) {
    console.log(hidden)
    const [SideBarActive, setSideBarActive] = useState(false)
    const [LiActive, setLiActive] = useState(0)
    return (
        <>
        <aside className={`sideBar ${hidden ? "Hidden" : SideBarActive ? "Active" : ""}`}>
            <header>
                <h1 className='logo'>DashHard</h1>  
            </header>
            <ul>
               {
                    MenuItems.map((AsideItemsMap, index) => (
                        <li key={index} className={`${LiActive === index ? 'Active' : ''}`}  onClick={()=> setLiActive(index)}>
                            <img src={AsideItemsMap.icon} alt="Icons" className={`${LiActive === index ? 'Active' : ''}`}/>
                            <p  className={`${LiActive === index ? 'Active' : ''}`}>{AsideItemsMap.title}</p>
                        </li>
                    ))
                }
            </ul>
            <div className="btns">
                <button className="btn ">View Github</button>
            </div>
        </aside>
        </>
    )
}
