import './StylesGlobals/Reset.css'
import './StylesGlobals/Assets.css'
import './StylesGlobals/Root.css'
import Navbar from './Components/NavbarComponent/Navbar'
import CardsMain from './Components/CardsMainComponent/CardsMain'
import Tables from './Components/Tables/Tables'
import Config from './Components/ConfigComponent/Config'
import './StylesGlobals/Media.css'
export default function App() {

  return (
    <>
      <Navbar />
      <main>
        <CardsMain />
        <Tables/>
        <Config/>
      </main>
    </>
  )
}


