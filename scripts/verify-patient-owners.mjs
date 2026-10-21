// Local integration check. Creates only uniquely named temporary owners/pets and cleans them up.
import assert from 'node:assert/strict'
import { databaseUrl } from './database.mjs'
import { randomUUID } from 'node:crypto'
import mysql from 'mysql2/promise'
const base='http://localhost:3000'
const cookies=new Map()
async function request(path,method='GET',body,form=false){
 const response=await fetch(base+path,{method,redirect:'manual',headers:{cookie:[...cookies].map(([key,value])=>`${key}=${value}`).join('; '),...(body?{'Content-Type':form?'application/x-www-form-urlencoded':'application/json'}:{})},body:body?(form?new URLSearchParams(body):JSON.stringify(body)):undefined})
 for(const cookie of response.headers.getSetCookie()){const pair=cookie.split(';')[0];const index=pair.indexOf('=');cookies.set(pair.slice(0,index),pair.slice(index+1))}
 const text=await response.text()
 let data
 try{data=JSON.parse(text)}catch{data={}}
 return {status:response.status,data}
}
const marker='Verification-'+randomUUID().slice(0,8)
const db=await mysql.createConnection(databaseUrl())
const createdOwners=[]
let petId
try{
 assert.equal((await request('/api/owners')).status,401,'Owner details require sign-in')
 const csrf=await request('/api/auth/csrf')
 await request('/api/auth/callback/credentials','POST',{csrfToken:csrf.data.csrfToken,email:process.env.TEST_EMAIL||'admin@khanpets.com',password:process.env.TEST_PASSWORD||'admin123',callbackUrl:base+'/dashboard',json:'true'},true)
 assert.equal((await request('/api/owners')).status,200,'Local sign-in succeeded')
 const owner={firstName:marker,lastName:'Temporary',phone:'03000000000',email:'owner@example.invalid',address:'Temporary verification address',emergencyContact:'Test contact',emergencyPhone:'03000000001'}
 const one=await request('/api/owners','POST',owner)
 assert.equal(one.status,201);createdOwners.push(one.data.ownerId)
 const two=await request('/api/owners','POST',{...owner,lastName:'Replacement'})
 assert.equal(two.status,201);createdOwners.push(two.data.ownerId)
 const invalid=await request('/api/owners','POST',{...owner,phone:'invalid'})
 assert.equal(invalid.status,400,'Invalid phone rejected')
 const pet={name:marker,species:'Cat',age:2,weight:4.5,gender:'Female',dateOfBirth:null,ownerId:createdOwners[0],breed:'Domestic',notes:'Temporary verification record'}
 const added=await request('/api/patients','POST',pet)
 assert.equal(added.status,201)
 petId=added.data.data.pets.find(item=>item.name===marker).id
 const edited=await request('/api/owners','PATCH',{...owner,id:createdOwners[0],phone:'03000000002',email:'',address:'',emergencyContact:'',emergencyPhone:''})
 assert.equal(edited.status,200)
 const savedOwner=edited.data.data.owners.find(item=>item.id===createdOwners[0])
 assert.equal(savedOwner.phone,'03000000002')
 assert.equal(savedOwner.email,null);assert.equal(savedOwner.address,null);assert.equal(savedOwner.emergencyContact,null);assert.equal(savedOwner.emergencyPhone,null)
 const blocked=await request('/api/owners','DELETE',{id:createdOwners[0]})
 assert.equal(blocked.status,409,'Cannot remove an owner with linked pets')
 const refreshed=await request('/api/patients')
 assert.equal(refreshed.data.find(item=>item.id===petId).owner.phone,'03000000002','Updated owner details persist for patient')
 const reassigned=await request('/api/patients','PATCH',{...pet,id:petId,ownerId:createdOwners[1]})
 assert.equal(reassigned.status,200)
 assert.equal(reassigned.data.data.pets.find(item=>item.id===petId).ownerId,createdOwners[1])
 assert.equal((await request('/api/owners','DELETE',{id:createdOwners[0]})).status,200,'Unlinked owner can be removed')
 assert.equal((await request('/api/owners','DELETE',{id:createdOwners[0]})).status,404,'Repeated removal reports not found')
 assert.equal((await request('/api/patients','PATCH',{...pet,id:petId,ownerId:createdOwners[1],age:-1})).status,400,'Negative age rejected')
 const inline=await request('/api/patients','POST',{...pet,ownerId:undefined,owner:{...owner,lastName:'Inline'},microchipId:marker})
 assert.equal(inline.status,201,'Pet and new owner are saved together')
 const inlineOwner=inline.data.data.owners.find(item=>item.firstName===marker&&item.lastName==='Inline')
 createdOwners.push(inlineOwner.id)
 assert.ok(inline.data.data.pets.some(item=>item.name===marker&&item.ownerId===inlineOwner.id),'New pet links to new owner')
 const duplicate=await request('/api/patients','POST',{...pet,ownerId:undefined,owner:{...owner,lastName:'Rollback'},microchipId:marker})
 assert.equal(duplicate.status,409,'Duplicate microchip rejected')
 const ownerList=await request('/api/owners')
 assert.ok(!ownerList.data.some(item=>item.firstName===marker&&item.lastName==='Rollback'),'Failed pet registration rolls back owner creation')
 console.log('Passed: authenticated access, owner creation/edit/optional-field removal, linked-owner deletion protection, pet registration/reassignment, persistence, validation, and owner removal.')
}finally{
 if(petId)await db.execute('DELETE FROM Pet WHERE id=? AND name=?',[petId,marker])
 // Also handle a response failure after registration committed.
 await db.execute('DELETE FROM Pet WHERE name=? AND notes=?',[marker,'Temporary verification record'])
 for(const id of createdOwners)await db.execute('DELETE FROM Owner WHERE id=? AND firstName=? AND NOT EXISTS (SELECT id FROM Pet WHERE ownerId=?)',[id,marker,id])
 await db.end()
 console.log('Temporary verification records cleaned up.')
}

