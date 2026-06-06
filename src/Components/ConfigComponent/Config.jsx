import './Styles/Config.css'
import { useState} from 'react'
function Btn(props) {
    return (
        <>
            <div className="itemConfig">
                <h1>{props.title}</h1>
                <button className={`btn ${props.isActive ? 'Active' : ''}`} onClick={props.onClick}>
                </button>
            </div>
        </>
    )
}
export default function Config() {
    const [btnActive, setbtnActive] = useState(false)
    const [btn, setBtn] = useState({ btnRemoveNavbar: false, btnRemoveScroll: false, btnRemoveBtnConfig: false })

    return (
        <>
            <button className={`btnConfig ${btnActive ? 'Active' : ''}`} onClick={() => setbtnActive(true)}>
                <img src={`https://img.icons8.com/?size=100&id=364&format=png&color=000000 `} alt="Icon Config" className='iconConfig' />
            </button>
            <section className={`configSection ${btnActive ? 'Active' : ''}`}>
                <header>
                    <h1 className='title'>Settings</h1>
                    <button className='closeConfig' onClick={() => setbtnActive(false)}>X</button>
                </header>
                <Btn title='Remove Navbar' isActive={btn.btnRemoveNavbar} onClick={() => {
                    setBtn({ ...btn, btnRemoveNavbar: btn.btnRemoveNavbar ? false : true })
                    const Navbar = document.querySelector('.navbarSection')
                    console.log(Navbar)
                    if (!btn.btnRemoveNavbar) {
                        Navbar.style.display = 'none'
                    } else {
                        Navbar.style.display = 'flex'
                    }
                }}>

                </Btn>
                <Btn title='Remove Scroll' isActive={btn.btnRemoveScroll} onClick={() => {
                    setBtn({ ...btn, btnRemoveScroll: btn.btnRemoveScroll ? false : true })
                    const body = document.body
                    if (body.style.overflow === 'hidden') {
                        body.style.overflow = 'auto'
                    } else {
                        body.style.overflow = 'hidden'
                    }

                }}>

                </Btn>
                <Btn title='Remove Config Button' isActive={btn.btnRemoveBtnConfig} onClick={() => {
                    setBtn({ ...btn, btnRemoveBtnConfig: btn.btnRemoveBtnConfig ? false : true })
                    if (!btn.btnRemoveBtnConfig) {
                        BtnConfig.style.display = 'none'
                    } else {
                        const BtnConfig = document.querySelector('.btnConfig')
                        BtnConfig.style.display = 'flex'
                    }
                }}>
                </Btn>
             
            </section>
        </>
    )
}