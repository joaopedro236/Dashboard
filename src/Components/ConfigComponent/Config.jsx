import './Styles/Config.css'
import { useEffect, useState } from 'react'
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
export default function Config({ ui, setUi, isOpen }) {
    const toggleNavbar = () => {
        setUi(prev => ({
            ...prev,
            hideNavbar: !prev.hideNavbar
        }));
    };


    const [removeBtnConfig, setRemoveBtnConfig] = useState(false)

    const body = document.body

    const [btn, setBtn] = useState({ btnRemoveNavbarOrSideBar: false, btnRemoveScroll: false, btnRemoveBtnConfig: false })

    return (
        <>
            <button className={`btnConfig ${isOpen ? 'Active' : ''} ${removeBtnConfig ? 'Hidden' : ''}`} onClick={() => setUi(prev => ({ ...prev, isOpen: true }))}>
                <img src={`https://img.icons8.com/?size=100&id=364&format=png&color=000000 `} alt="Icon Config" className='iconConfig' loading="lazy" decoding="async" />
            </button>
            <section className={`configSection ${isOpen ? 'Active' : ''} `}>
                <header>
                    <h1 className='title'>Settings</h1>
                    <button className='closeConfig' onClick={() => setUi(prev => ({ ...prev, isOpen: false }))}>X</button>
                </header>
                <Btn class='removeNavbar' title='Remove Navbar' isActive={ui.hideNavbar} onClick={toggleNavbar}>

                </Btn>

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
                    setRemoveBtnConfig(prev => !prev)
                }}>
                </Btn>

            </section>
        </>
    )
}


