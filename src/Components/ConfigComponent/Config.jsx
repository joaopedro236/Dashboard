import './Styles/Config.css'
import { useState } from 'react'
function Btn(props) {
    return (
        <>
            <div className={`itemConfig ${props.class}`}>
                <h1>{props.title}</h1>
                <button className={`btnActiveConfig  ${props.isActive ? 'Active' : ''}`} onClick={props.onClick}>
                </button>
            </div>
        </>
    )
}
export default function Config({ ui, setUi, hidden}) {
    const toggleNavbar = () => {
        setUi(prev => ({
            ...prev,
            hideNavbar: !prev.hideNavbar
        }));
    };
    const toggleSidebar = () => {
        setUi(prev => ({
            ...prev,
            hideSideBar: !prev.hideSideBar
        }))
    }
    const body = document.body
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    if (ui.hideSideBar) {
        body.style.paddingLeft = '0px'
    } else {
        body.style.paddingLeft = mediaQuery.matches ? '0px' : '260px';
    }
    const [btnActive, setbtnActive] = useState(false)
    const [btn, setBtn] = useState({ btnRemoveNavbarOrSideBar: false, btnRemoveScroll: false, btnRemoveBtnConfig: false })

    return (
        <>
            <button className={`btnConfig ${btnActive ? 'Active' : ' ==='}`} onClick={() => setbtnActive(true)}>
                <img src={`https://img.icons8.com/?size=100&id=364&format=png&color=000000 `} alt="Icon Config" className='iconConfig' />
            </button>
            <section className={`configSection ${btnActive ? 'Active' : ''}`}>
                <header>
                    <h1 className='title'>Settings</h1>
                    <button className='closeConfig' onClick={() => setbtnActive(false)}>X</button>
                </header>
                <Btn class='removeNavbar' title='Remove Navbar' isActive={ui.hideNavbar} onClick={toggleNavbar}>

                </Btn>
                <Btn class='removeSideBar' title='Remove Sidebar' isActive={ui.hideSideBar} onClick={() => {
                    toggleSidebar()
                }}></Btn>
                <Btn title='Remove Scroll' isActive={btn.btnRemoveScroll} onClick={() => {

                    setBtn({ ...btn, btnRemoveScroll: btn.btnRemoveScroll ? false : true })
                    if (body.style.overflow === 'hidden') {
                        body.style.overflow = 'auto'
                    } else {
                        body.style.overflow = 'hidden'
                    }

                }}>

                </Btn>
                <Btn title='Remove Config Button' isActive={btn.btnRemoveBtnConfig} onClick={() => {
                    setBtn({ ...btn, btnRemoveBtnConfig: btn.btnRemoveBtnConfig ? false : true })
                }}>
                </Btn>

            </section>
        </>
    )
}

