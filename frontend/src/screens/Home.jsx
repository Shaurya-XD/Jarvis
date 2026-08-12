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
      const response = await axiosInstance.post('/projects/create', { name });
      console.log(response.data)

      setProjects(prevProjects => [
          ...prevProjects,
          response.data.project
      ]);

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
      <main className='min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10'>
        <div className='mx-auto max-w-6xl'>
          <header className='mb-10 flex flex-col gap-5 border-b border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <div className='mb-3 flex items-center gap-2 text-sm font-medium text-indigo-300'>
                <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300'><i className="ri-code-s-slash-line"></i></span>
                Workspace
              </div>
              <h1 className='text-3xl font-semibold tracking-tight text-white'>Your projects</h1>
              <p className='mt-2 text-slate-400'>Create, collaborate, and build in one shared workspace.</p>
            </div>
          <button onClick={()=>{
            setIsModelOpen(true);
          }} className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950'>
            <i className="ri-add-line text-xl"></i>
            <span>New project</span>
          </button>
          </header>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {
            projects.map((project) => {
              return(
                <div key={project._id} onClick={() => {
                  navigate(`/project`, {
                    state : {project}
                  })
                }} className='group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-black/20'>
                  <div className='flex items-start justify-between gap-3'>
                    <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-300'><i className="ri-folder-3-line"></i></span>
                    <i className="ri-arrow-right-up-line text-lg text-slate-600 transition group-hover:text-indigo-300"></i>
                  </div>
                  <div className='mt-5'>
                    <h2 className='truncate text-lg font-semibold text-white'>{project.name}</h2>
                    <div className='mt-3 flex items-center gap-2 text-sm text-slate-400'>
                      <i className="ri-group-line"></i>
                      <span>{project.users.length} collaborator{project.users.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                </div>
              )
            })
          }
          </div>
        </div>

        {isModelOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm'>
            <div className='w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl'>
              <div className='mb-6'>
                <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-xl text-indigo-300'><i className="ri-folder-add-line"></i></span>
                <h2 className='mt-4 text-2xl font-semibold text-white'>Create a project</h2>
                <p className='mt-1 text-sm text-slate-400'>Start a new shared coding workspace.</p>
              </div>
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <form onSubmit={(e) => {
                submitHandler(e);
              }}>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-slate-200' htmlFor="pName">Project name</label>
                  <input className='rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20' id='pName' type="text" placeholder='e.g. Portfolio website' value={name} onChange={(e) => {
                    setName(e.target.value)
                  }}/>
                </div>

                <div className='mt-6 flex justify-end items-center gap-3'>
                  <button type="button" onClick={()=>{
                    setName('');
                    setIsModelOpen(false);
                  }} className='rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white'>Cancel</button>

                  <button type="submit" className='rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400'>Create project</button>
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
