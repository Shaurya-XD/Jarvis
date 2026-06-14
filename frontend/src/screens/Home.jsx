import React, { useContext, useEffect, useState } from 'react'
import { useUserContext } from '../context/user.context'
import axiosInstance from '../config/axios';
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const {user, setUser} = useUserContext();
  const [name, setName] = useState('')
  const [isModelOpen, setIsModelOpen] = useState(false)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState([])

  const navigate = useNavigate();

  const createProject = (e) => {

  }

  useEffect(()=>{
    const fetchData = async() =>{
      try{
        const response = await axiosInstance.get('/projects/all');
        setProjects(response.data.projects)
      }catch (err) {
        console.log(err.response?.data?.error || 'Something went wrong')
      }
    }
    
    fetchData();
  }, [])

  const submitHandler = async(e) => {
    e.preventDefault();
    console.log(name);

    try{
      const reponse = await axiosInstance.post('/projects/create', {name});
      console.log(reponse);
      setIsModelOpen(false);
      setName('');

    }catch (err) {
      setError(
        err.response?.data?.error || 'Something went wrong'
      )
    }
  }

  return (
    <>
      <main className='p-4'>
        <div className='flex flex-wrap gap-4 items-center'>
          <button onClick={()=>{
            setIsModelOpen(true);
          }} className='bg-gray-300 border-4 border-black/20 py-4 px-10 rounded-2xl flex justify-between items-center hover:scale-105 gap-2'>
            <h2 className='font-semibold'>New Project</h2>
            <i className="ri-folder-add-line text-2xl"></i>
          </button>

          {
            projects.map((project) => {
              return(
                <div key={project._id} onClick={() => {
                  navigate(`/project`, {
                    state : {project}
                  })
                }} className='font-semibold py-3 px-4 my-2 rounded-xl flex flex-col items-center min-w-50 hover:bg-gray-400 bg-gray-100 border-2 border-black/20'>
                  <div>
                    <i className="ri-folder-line pr-1"></i>
                    {project.name}
                  </div>
                  <div className='flex gap-1'>
                    <i className="ri-group-line"></i>
                    {project.users.length}
                  </div>

                </div>
              )
            })
          }
        </div>

        {isModelOpen && (
          <div className='fixed h-screen w-screen top-0 left-0 bg-gray-600/50'>
            <div className='fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 p-8 bg-white rounded-2xl'>
              <h2 className='font-semibold text-2xl -mt-2'>Create New Project</h2>
              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl">
                  {error}
                </div>
              )}
              <form onSubmit={(e) => {
                submitHandler(e);
              }}>
                <div className='flex flex-col justify-between gap-0.5 py-3 -mt-1.5'>
                  <label htmlFor="pName">Project Name</label>
                  <input className='border px-2 py-1' id='pName' type="text" value={name} onChange={(e) => {
                    setName(e.target.value)
                  }}/>
                </div>

                <div className='flex justify-between items-center gap-4'>
                  <button type="submit" className='bg-green-400 py-2 px-7 rounded-xl text-white'>Create</button>

                  <button type="button" onClick={()=>{
                    setName('');
                    setIsModelOpen(false);
                  }} className='bg-red-400 py-2 px-7 rounded-xl text-white'>Cancle</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default Home