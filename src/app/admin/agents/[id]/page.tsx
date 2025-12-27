// app/admin/agents/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { ChevronLeft, ChevronDown, Loader2 } from 'lucide-react';

// Components
import AgentProfileCard from '@/app/components/features/admin/agents/details/AgentProfileCard';
import AgentPerformanceTab from '@/app/components/features/admin/agents/details/AgentPerformanceTab';
import AgentSalaryTab from '@/app/components/features/admin/agents/details/AgentSalaryTab';

// Services & Types
import { accountService, UserProfile, UpdateAccountRequest } from '@/lib/api/services/account.service';

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter(); 
  
  const [activeTab, setActiveTab] = useState<'performance' | 'salary'>('performance');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // State loading khi đang lưu
  const [isSaving, setIsSaving] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchProfile = async () => {
    try {
        const data = await accountService.getUserById(id);
        setProfile(data);
    } catch (error) {
        console.error("Failed to fetch agent profile", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchProfile();
  }, [id]);

  // --- LOGIC XÓA AGENT ---
  const handleDeleteAgent = async () => {
      if (!confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
          return;
      }
      try {
          await accountService.deleteAccountById(id);
          alert("Agent deleted successfully!");
          router.push('/admin/agents'); 
      } catch (error) {
          console.error(error);
          alert("Failed to delete agent.");
      }
  };

  // --- LOGIC LƯU AGENT (Mới) ---
  // Hàm này sẽ được gọi khi bấm "Confirm" ở card
  const handleSaveAgent = async (data: UpdateAccountRequest) => {
      setIsSaving(true);
      try {
          // Gọi API update (Admin update user khác)
          await accountService.updateUserById(id, data);
          alert("Agent profile updated successfully!");
          // Refresh lại data mới nhất
          await fetchProfile();
      } catch (error) {
          console.error(error);
          alert("Failed to update agent profile.");
      } finally {
          setIsSaving(false);
      }
  };


  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin"/></div>;
  if (!profile) return <div className="text-center py-10 text-gray-500">Agent not found</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* 1. Back Link */}
      <div>
         <Link 
            href="/admin/agents" 
            className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-xs font-medium"
         >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Agents List
         </Link>
      </div>

      {/* 2. Profile Card - Truyền thêm prop onSave và isSaving */}
      <AgentProfileCard 
          profile={profile} 
          onDelete={handleDeleteAgent}
          onSave={handleSaveAgent} // Truyền hàm lưu
          isSaving={isSaving}      // Truyền trạng thái loading
      />

      {/* ... (Phần Tabs giữ nguyên) ... */}
      <div className="flex flex-col md:flex-row items-end justify-between border-b border-gray-200">
          {/* ... các nút tabs ... */}
          <div className="flex gap-6">
              <button onClick={() => setActiveTab('performance')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'performance' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Performance</button>
              <button onClick={() => setActiveTab('salary')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'salary' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Salary</button>
          </div>
          <div className="mb-2 relative">
             <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-xs text-gray-700 transition-all min-w-[130px] justify-between">
                {selectedMonth}/{selectedYear}
                <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </div>
      </div>

      {/* 4. Tab Content */}
      <div className="pt-2">
          {activeTab === 'performance' ? (
              <AgentPerformanceTab agentId={id} month={selectedMonth} year={selectedYear} />
          ) : (
              <AgentSalaryTab agentId={id} month={selectedMonth} year={selectedYear} />
          )}
      </div>
    </div>
  );
}