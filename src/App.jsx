import './StylesGlobals/Reset.css'
import './StylesGlobals/Assets.css'
import './StylesGlobals/Root.css'
import Navbar from './Components/NavbarComponent/Navbar'
import { useState,useEffect } from 'react'
import SideBar from './Components/SideBarComponent/SideBar'
import Config from './Components/ConfigComponent/Config'
import CardsMain from './Components/CardsMainComponent/CardsMain'
import Tables from './Components/Tables/Tables'
import './StylesGlobals/Media.css'
export default function App() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  },[])
  const [ui, setUi] = useState({

    hideNavbar: false,
    hideSideBar: false,
    isOpen: false
  });
  return (
    <>
      <Navbar hidden={ui.hideNavbar}/>
      <SideBar  hidden={ui.hideSideBar}/>
      <main>
        <CardsMain   ui={ui} setUi={setUi} />
        <Tables />
        <Config  ui={ui} setUi={setUi} isOpen={ui.isOpen}/>
    
      </main>
    </>
  )
}

