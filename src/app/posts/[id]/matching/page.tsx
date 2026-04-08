'use client'

import React, { useState } from 'react'
import {  MessageCircle, Heart as HeartIcon } from 'lucide-react'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import { useRouter } from 'next/navigation'

export default function MatchingPage() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState('latest')

  return (
    <>
      <TopAppBar
        showBack
        onBackClick={() => router.back()}
        title="모집글"
        showAvatar
      />

      <main className="pt-20 pb-32 px-4">
        {/* Post Header */}
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-pink to-accent-purple rounded-lg" />
            <div className="flex-1">
              <p className="font-semibold text-text-primary text-sm">하니_러브</p>
              <div className="flex items-center gap-2">
                <Tag label="뉴진스" variant="filter" />
                <span className="text-xs text-text-muted">3시간 전</span>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-text-primary mb-3">
            뉴진스 콘서트 1일차 같이 갈 버니즈 구합니다 🐰
          </h2>

          <p className="text-text-secondary text-sm mb-3">
            안녕하세요! 저는 뉴진스의 열성 팬인 25살 여성입니다. 이번 콘서트 1일차에 함께 갈 분을 찾고 있어요. 콘서트 티켓은 이미 구했고, 응원봉도 준비 완료했습니다. 함께 재미있는 시간을 보낼 수 있으면 좋겠습니다!
          </p>

          <div className="flex flex-wrap gap-2">
            {['뉴진스팬', '서울/경기', '콘서트'].map(tag => (
              <Tag key={tag} label={tag} variant="filter" />
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary text-lg">댓글</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-muted px-2 py-1 rounded border-0 focus:outline-none"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
            </select>
          </div>

          {/* Comment 1 with Matching Tool */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-mint to-accent-pink rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-text-primary text-sm">민지_shine</p>
                <p className="text-xs text-text-muted mb-2">1시간 전</p>
                <p className="text-text-secondary text-sm">
                  저도 둘째 날 가요! 같이 가고 싶어요. 데뷔 때부터 팬이었고 응원봉도 준비 완료했습니다! ✨
                </p>
                <div className="flex gap-4 mt-3 text-sm font-medium text-text-secondary">
                  <button className="hover:text-primary">♥ 좋아요</button>
                  <button className="hover:text-primary">대댓글</button>
                </div>
              </div>
            </div>

            {/* Author Reply with Matching Tool */}
            <div className="ml-8 mb-4 pb-4 border-l-2 border-border pl-4">
              <div className="flex gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-pink to-accent-purple rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-text-primary text-sm">하니_러브</p>
                  <p className="text-xs text-text-muted mb-2">방금 전</p>
                  <p className="text-text-secondary text-sm">
                    정말 좋네요! 혹시 특별 한정판 커버도 챙겨오시나요?
                  </p>
                </div>
              </div>

              {/* Matching Tool */}
              <div className="bg-gradient-to-r from-accent-pink/10 to-accent-purple/10 border-2 border-accent-pink/30 rounded-lg p-3 mb-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                  <HeartIcon size={16} className="text-accent-pink" />
                  매칭을 진행하시겠어요?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">수락하기</Button>
                  <Button size="sm" variant="secondary" className="flex-1">거절하기</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comment 2 */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-text-primary text-sm">여행가는덕</p>
                <p className="text-xs text-text-muted mb-2">30분 전</p>
                <p className="text-text-secondary text-sm">
                  혹시 티켓 아직 남아있나요? 이거 보러 한국에서 날아가는 중이에요!
                </p>
                <div className="flex gap-4 mt-3 text-sm font-medium text-text-secondary">
                  <button className="hover:text-primary">♥ 좋아요</button>
                  <button className="hover:text-primary">대댓글</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Comment Input Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-border px-4 py-3">
        <div className="flex items-end gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-pink to-accent-purple rounded-lg flex-shrink-0" />
          <input
            type="text"
            placeholder="하니_러브님에게 댓글 쓰기..."
            className="flex-1 px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <MessageCircle size={20} className="text-primary" />
          </button>
        </div>
      </div>

      <BottomNavBar />
    </>
  )
}
