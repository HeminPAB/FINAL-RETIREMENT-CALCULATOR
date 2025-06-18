import Image from 'next/image';

const Layout = ({ children }) => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 