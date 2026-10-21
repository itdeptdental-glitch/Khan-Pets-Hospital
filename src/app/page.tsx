import Link from 'next/link'
import Image from 'next/image'

import { Icon } from '@/components/ui/icon'
const services = [
 ['patients','Pet registration','Every pet profile, in one place.'],
 ['doctors','Medical services','Connected, comprehensive care.'],
 ['records','Pharmacy & food','The essentials for healthier pets.'],
 ['shield','Boarding','A comfortable home away from home.'],
 ['dashboard','Grooming','Care that keeps pets feeling their best.'],
 ['appointments','Vaccinations','Stay on top of preventive care.'],
]
export default function Home() {
 return <main className="public-page home-page"><div className="home-pets" aria-hidden="true">{['\u{1F415}','\u{1F408}','\u{1F407}','\u{1F43E}','\u{1F408}','\u{1F415}'].map((pet,index)=><span className="home-pet" key={index}>{pet}</span>)}</div><section className="home-heading"><div className="home-logo"><Image src="/logo.jpg" alt="Khan Pets Hospital" width={132} height={132} priority/></div><h1 className="home-hospital-name">Khan Pets Hospital</h1><p className="home-hospital-location">Rahim Yar Khan</p><p className="eyebrow">Compassionate care. Connected practice.</p><h2 className="home-tagline">Better care starts here.</h2><p>Your complete veterinary workspace at Khan Pets Hospital, Rahim Yar Khan.</p></section><section className="home-services" aria-label="Our services">{services.map(([icon,title,description])=><article className="ui-card home-service" key={title}><span className="action-icon"><Icon name={icon}/></span><div><h2>{title}</h2><p>{description}</p></div></article>)}</section><div className="home-cta"><Link href="/login" className="ui-button primary lg">Get Started <Icon name="arrow"/></Link><p>One workspace. Every aspect of pet care.</p></div><footer className="home-footer">Khan Pets Hospital &middot; Rahim Yar Khan</footer></main>
}




