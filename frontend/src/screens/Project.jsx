import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import axiosInstance from '../config/axios'; 
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';

const Project = () => {
  const location = useLocation();
  console.log(location.state);

  const [allUsers, setAllUsers] = useState([])

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [collaborators, setCollaborators] = useState(
    location.state.project.users || []
  );

  const isClicked = useRef(null);
  const sidePanel = useRef(null);

  const [users, setUsers] = useState([]);

  const projectId = location.state.project._id;

  useEffect(() => {
    initializeSocket();

    const fetchData = async() => {
      try{
        const response = await axiosInstance.get('/users/all');
        console.log(response.data.users);
        const fetchedUsers = response.data.users;
        setAllUsers(response.data.users);

        const remainingUsers = fetchedUsers.filter(
          (user) => !collaborators.includes(user._id)
        );
        setUsers(remainingUsers);

      }catch (err) {
        console.log(err.response?.data?.error || 'Something went wrong')
      }
    }

    fetchData();
  },[])

  useGSAP(() => {
    if (isPanelOpen) {
      gsap.to(sidePanel.current, {
        x: "0%",
        duration: 0.3
      });

      gsap.to(isClicked.current, {
        backgroundColor: "#d1d5db",
        duration: 0.3
      });
    } else {
      gsap.to(sidePanel.current, {
        x: "-100%",
        duration: 0.3
      });

      gsap.to(isClicked.current, {
        backgroundColor: "#6a7282",
        duration: 0.3
      });
    }
  }, [isPanelOpen]);

  const handleUserSelect = (userId) => {
  setSelectedUsers((prev) => {

    if (prev.includes(userId)) {
      return prev.filter((id) => id !== userId);
    }

    return [...prev, userId];
  });
};

  const addCollaborators = () => {
    setCollaborators((prev) => {
      return [...prev, ...selectedUsers]
    });

    const postData = async() => {
      try{
        const response = await axiosInstance.put('/projects/add-user',{
          projectId,
          users: selectedUsers
        })
      }catch (err) {
        console.log(err.response?.data?.error || 'Something went wrong')
      }
    }

    postData();

    setUsers((prev) =>
      prev.filter((user) => !selectedUsers.includes(user._id))
    );

    setShowCollaboratorModal(false);
    setSelectedUsers([]);
  };

  return (
    <main className='h-screen w-screen bg-gray-100 flex'>

      {/* ================= Left Chat Section ================= */}

      <section className='bg-gray-300 h-full min-w-90 flex flex-col justify-between'>

        <header className='flex justify-between p-3 w-full bg-gray-500 rounded'>

          <button
            onClick={() => setShowCollaboratorModal(true)}
            className='flex items-center justify-start gap-2 border px-2 py-1 rounded-xl hover:bg-white/20 transition'
          >
            <i className="ri-user-add-line"></i>
            <h3>Add Collaborator</h3>
          </button>

          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            <i
              ref={isClicked}
              className="ri-team-line border p-1 rounded-full text-xl"
            ></i>
          </button>

        </header>

        {/* ================= Messages ================= */}

        <div className="message-box relative flex flex-col justify-start grow overflow-hidden">

          {/* Team Side Panel */}

          <div
            ref={sidePanel}
            className="absolute -left-2 -top-1 w-92 h-full z-10 bg-gray-200 flex flex-col px-2 translate-x-[-100%]"
          >

            <h3 className='font-semibold text-lg p-3 border-b'>
              Team Members
            </h3>

            {collaborators.length === 0 ? (
              <p className='p-3 text-gray-500'>
                No collaborators added
              </p>
            ) : (
              collaborators.map((id) => {
                const user = allUsers.find((u) => u._id === id);

                return (
                  <div
                    key={id}
                    className="user p-2 flex items-center gap-2 text-lg hover:bg-gray-300"
                  >
                    <i className="ri-user-3-line px-1 rounded-full border"></i>
                    <h5>{user?.email}</h5>
                  </div>
                );
              })
            )}

          </div>

          <div className="incoming bg-gray-200 px-2 pb-1 rounded-lg w-fit overflow-auto max-w-70 mt-2 mx-2">
            <h6 className='-mb-0.5 text-sm font-light'>
              example@gmail.com
            </h6>
            <p>Hello</p>
          </div>

          <div className="outgoing bg-gray-400 px-2 pb-1 rounded-lg max-w-70 overflow-auto mt-2 mx-2 ml-auto">
            <h6 className='-mb-0.5 text-sm font-light'>
              example@gmail.com
            </h6>
            <p>Hieee</p>
          </div>

        </div>

        {/* ================= Input Box ================= */}

        <div className="input-box flex justify-between py-2 m-2 px-4 border-2 rounded-2xl border-black/50">

          <input
            type="text"
            placeholder='Enter a message'
            className='text-xl border-none outline-none bg-transparent'
          />

          <button className='px-2 -mr-2.5'>
            <i className="ri-send-plane-line text-2xl opacity-60"></i>
          </button>

        </div>

      </section>

      {/* ================= Collaborator Modal ================= */}

      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[380px] rounded-xl shadow-xl p-4">

            {/* Header */}

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-2xl font-semibold">
                Select Users
              </h2>

              <button
                onClick={() => {
                  setShowCollaboratorModal(false);
                  setSelectedUsers([]);
                }}
                className="text-xl"
              >
                <i className="ri-close-line"></i>
              </button>

            </div>

            {/* User List */}

            <div className="max-h-[350px] overflow-y-auto">

              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user._id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 border transition-all
                  
                  ${
                    selectedUsers.includes(user._id)
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-100 border-transparent"
                  }`}
                >

                  <i className="ri-user-3-fill text-2xl"></i>

                  <div>
                    <h4 className="font-medium text-lg">
                      {user.email}
                    </h4>
                  
                  </div>

                </div>
              ))}

            </div>

            {/* Footer */}

            <button
              onClick={addCollaborators}
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Collaborators
            </button>

          </div>

        </div>
      )}

    </main>
  );
};

export default Project;