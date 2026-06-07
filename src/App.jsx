import './StylesGlobals/Reset.css'
import './StylesGlobals/Assets.css'
import './StylesGlobals/Root.css'
import Navbar from './Components/NavbarComponent/Navbar'
import { useState } from 'react'
import SideBar from './Components/SideBarComponent/SideBar'
import CardsMain from './Components/CardsMainComponent/CardsMain'
import Tables from './Components/Tables/Tables'
import Config from './Components/ConfigComponent/Config'
import './StylesGlobals/Media.css'
export default function App() {
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

