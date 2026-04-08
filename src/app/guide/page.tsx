'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'

// ─── 3D 구 SVG 헬퍼 ─────────────────────────────────────────────────────────

function Sphere({ size, grad, style }: {
  size: number
  grad: [string, string, string]  // [highlight, mid, shadow]
  style?: React.CSSProperties
}) {
  const id = `g${grad[0].replace('#', '')}`
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor={grad[0]} />
          <stop offset="55%"  stopColor={grad[1]} />
          <stop offset="100%" stopColor={grad[2]} />
        </radialGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={size/2 - 1} fill={`url(#${id})`} />
      {/* specular highlight */}
      <ellipse cx={size*0.38} cy={size*0.3} rx={size*0.12} ry={size*0.08}
        fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}

// ─── 히어로 섹션 ─────────────────────────────────────────────────────────────

function HeroBanner() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #f5d0fe 65%, #ede9fe 100%)',
        paddingTop: 64,
        paddingBottom: 48,
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      {/* 배경 구들 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <Sphere size={180} grad={['#fff1f9','#f9a8d4','#e879f9']}
          style={{ position:'absolute', right:-50, top:-40, opacity:0.85 }} />
        <Sphere size={90} grad={['#f5f3ff','#ddd6fe','#c4b5fd']}
          style={{ position:'absolute', right:90, bottom:-20, opacity:0.9 }} />
        <Sphere size={48} grad={['#e0f2fe','#bae6fd','#7dd3fc']}
          style={{ position:'absolute', right:200, top:30, opacity:0.85 }} />
        <Sphere size={28} grad={['#fef9c3','#fde68a','#fcd34d']}
          style={{ position:'absolute', left:30, top:24, opacity:0.75 }} />
        {/* 링들 */}
        <div style={{
          position:'absolute', width:100, height:100, right:45, bottom:20,
          borderRadius:'50%', border:'12px solid rgba(196,181,253,0.4)',
          transform:'rotate(-30deg) scaleX(0.5)',
        }} />
        <div style={{
          position:'absolute', width:56, height:56, right:210, top:60,
          borderRadius:'50%', border:'8px solid rgba(249,168,212,0.45)',
          transform:'rotate(20deg) scaleX(0.52)',
        }} />
        {/* 글로우 */}
        <div style={{
          position:'absolute', width:200, height:200, right:0, top:0,
          borderRadius:'50%',
          background:'radial-gradient(circle, rgba(232,121,249,0.15) 0%, transparent 70%)',
        }} />
      </div>

      {/* 텍스트 */}
      <div className="relative z-10">
        <div
          className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-[11px] font-bold mb-4"
          style={{ backgroundColor:'rgba(167,139,250,0.18)', color:'#7c3aed', backdropFilter:'blur(4px)' }}
        >
          ✈️ flyfan 시작하기
        </div>
        <h1
          className="text-[32px] font-extrabold leading-[40px] tracking-[-1px] mb-3"
          style={{ color:'#5b21b6' }}
        >
          플라이팬을<br />소개할게요!
        </h1>
        <p className="text-[14px] font-medium leading-[22px]" style={{ color:'#a855f7' }}>
          K-pop 팬들을 위한 덕메 & 비계친 매칭 플랫폼.<br />
          취향 맞는 덕질 친구를 쉽고 안전하게 만나세요.
        </p>
      </div>
    </div>
  )
}

// ─── 가이드 섹션 카드 ─────────────────────────────────────────────────────────

interface GuideStep {
  emoji: string
  label: string
  description: string
}

interface GuideSectionProps {
  index: number
  title: string
  subtitle: string
  steps: GuideStep[]
  accentFrom: string
  accentTo: string
  headingColor: string
  labelColor: string
  sphereGrads: [string, string, string][]
  cta?: { label: string; href: string }
}

function GuideSection({ index, title, subtitle, steps, accentFrom, accentTo, headingColor, labelColor, sphereGrads, cta }: GuideSectionProps) {
  return (
    <div className="px-5 mb-8">
      <div
        className="relative overflow-hidden rounded-[28px] p-6"
        style={{
          background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)`,
        }}
      >
        {/* 배경 구 장식 */}
        <div className="absolute right-0 top-0 pointer-events-none" aria-hidden="true">
          {sphereGrads.map((g, i) => (
            <Sphere key={i} size={[72, 44, 28][i] ?? 28} grad={g}
              style={{
                position:'absolute',
                right: [-20, 30, 60][i],
                top:  [-20, 20, -10][i],
                opacity: 0.8,
              }} />
          ))}
        </div>

        {/* 섹션 번호 + 제목 */}
        <div className="relative z-10 mb-5">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-extrabold mb-3"
            style={{ backgroundColor:'rgba(255,255,255,0.65)', color: headingColor }}
          >
            {index}
          </span>
          <h2 className="text-[20px] font-extrabold leading-[26px] tracking-[-0.5px]" style={{ color: headingColor }}>{title}</h2>
          <p className="text-[12px] font-medium mt-1" style={{ color: labelColor }}>{subtitle}</p>
        </div>

        {/* 스텝 카드들 */}
        <div className="relative z-10 flex flex-col gap-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-[18px]"
              style={{ backgroundColor:'rgba(255,255,255,0.65)', backdropFilter:'blur(8px)' }}
            >
              <span className="text-2xl shrink-0 mt-0.5">{step.emoji}</span>
              <div>
                <p className="text-[13px] font-bold" style={{ color: headingColor }}>{step.label}</p>
                <p className="text-[11px] font-medium leading-[17px] mt-0.5 text-zinc-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        {cta && (
          <div className="relative z-10 mt-4">
            <Link href={cta.href}>
              <button
                className="w-full h-12 rounded-full text-[14px] font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor:'rgba(255,255,255,0.9)', color: headingColor }}
              >
                {cta.label}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 화면 가이드 미니맵 ──────────────────────────────────────────────────────

function ScreenGuide() {
  const [active, setActive] = useState(0)

  const screens = [
    {
      label: '홈',
      emoji: '🏠',
      color: '#7c3aed',
      preview: [
        { h: 12, w: '60%', bg: '#ede9fe', label: '탭: 덕메/비계친' },
        { h: 10, w: '100%', bg: '#f4f4f5', label: '검색바' },
        { h: 40, w: '100%', bg: '#ddd6fe', label: '프로모 배너' },
        { h: 52, w: '100%', bg: '#ede9fe', label: '모집 카드' },
        { h: 52, w: '100%', bg: '#ede9fe', label: '모집 카드' },
      ],
      desc: '덕메/비계친 탭으로 전환하고, 검색으로 원하는 글을 빠르게 찾아요.',
    },
    {
      label: '모집글',
      emoji: '📋',
      color: '#c026d3',
      preview: [
        { h: 14, w: '70%', bg: '#fce7f3', label: '작성자 정보' },
        { h: 16, w: '90%', bg: '#fdf4ff', label: '제목' },
        { h: 32, w: '100%', bg: '#fce7f3', label: '본문' },
        { h: 10, w: '80%', bg: '#f5d0fe', label: '태그' },
        { h: 28, w: '100%', bg: '#fce7f3', label: '댓글' },
      ],
      desc: '글 내용, 조건, 댓글을 확인하고 작성자에게 댓글로 신청해요.',
    },
    {
      label: '작성',
      emoji: '✍️',
      color: '#0891b2',
      preview: [
        { h: 14, w: '100%', bg: '#e0f2fe', label: '제목 입력' },
        { h: 14, w: '100%', bg: '#e0f2fe', label: '아티스트 선택' },
        { h: 10, w: '60%', bg: '#bae6fd', label: '지역/날짜' },
        { h: 12, w: '80%', bg: '#e0f2fe', label: '참여 조건 키워드' },
        { h: 36, w: '100%', bg: '#bae6fd', label: '소개글' },
      ],
      desc: '제목, 아티스트, 지역, 조건을 설정하고 모집글을 작성해요.',
    },
    {
      label: '프로필',
      emoji: '💎',
      color: '#059669',
      preview: [
        { h: 14, w: '100%', bg: '#d1fae5', label: '페르소나 슬롯' },
        { h: 24, w: '100%', bg: '#ecfdf5', label: '기본 정보' },
        { h: 18, w: '100%', bg: '#d1fae5', label: '덕질 타임라인' },
        { h: 14, w: '100%', bg: '#ecfdf5', label: '세이프 존' },
      ],
      desc: '페르소나로 나를 표현하고, 덕질 프로필로 좋은 매칭을 만들어요.',
    },
  ]

  const cur = screens[active]

  return (
    <div className="px-5 mb-8">
      <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">화면 가이드</p>

      {/* 탭 */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {screens.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="flex items-center gap-1.5 shrink-0 h-9 px-4 rounded-full text-[12px] font-bold transition-all"
            style={{
              backgroundColor: active === i ? s.color : '#f4f4f5',
              color: active === i ? '#fff' : '#71717a',
            }}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* 미리보기 */}
      <div
        className="rounded-[24px] p-5 flex flex-col gap-3"
        style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
      >
        {/* 폰 프레임 미니 */}
        <div
          className="mx-auto rounded-[20px] overflow-hidden flex flex-col gap-2 p-4"
          style={{
            width: 180, minHeight: 240,
            backgroundColor: '#fff',
            border: `2px solid ${cur.color}33`,
            boxShadow: `0 8px 32px ${cur.color}22`,
          }}
        >
          {/* 상단 바 */}
          <div className="flex justify-between items-center mb-1">
            <div className="w-8 h-1.5 rounded-full" style={{ backgroundColor: `${cur.color}44` }} />
            <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: `${cur.color}33` }} />
          </div>
          {/* 화면 요소들 */}
          {cur.preview.map((el, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div
                className="rounded-[6px] flex items-center justify-center"
                style={{ height: el.h, width: el.w, backgroundColor: el.bg }}
              >
                <span className="text-[7px] font-bold" style={{ color: cur.color + 'bb' }}>{el.label}</span>
              </div>
            </div>
          ))}
        </div>
        {/* 설명 */}
        <p className="text-[13px] font-medium text-zinc-600 leading-[20px] text-center px-2">
          {cur.desc}
        </p>
      </div>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function GuidePage() {
  const router = useRouter()

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} />

      <main className="pb-[128px]">
        <HeroBanner />

        <div className="pt-8">

          {/* ── 섹션 1: 덕메 찾기 ── */}
          <GuideSection
            index={1}
            title="덕메 찾기"
            subtitle="함께 콘서트, 카페투어, 행사를 즐길 덕질 메이트"
            accentFrom="#f5f3ff"
            accentTo="#ede9fe"
            headingColor="#5b21b6"
            labelColor="#7c3aed"
            sphereGrads={[
              ['#f5f3ff','#ddd6fe','#c4b5fd'],
              ['#ede9fe','#c4b5fd','#a78bfa'],
              ['#faf5ff','#e9d5ff','#d8b4fe'],
            ]}
            steps={[
              {
                emoji: '🔍',
                label: '원하는 글 찾기',
                description: '홈 상단의 "덕메 찾기" 탭을 누르고 검색이나 필터로 원하는 모집글을 찾아요.',
              },
              {
                emoji: '💬',
                label: '댓글로 신청하기',
                description: '글을 클릭하고 댓글로 인사를 건네세요. 작성자가 확인 후 매칭을 진행해요.',
              },
              {
                emoji: '🎫',
                label: '직접 모집하기',
                description: '오른쪽 하단 + 버튼 → "덕메 모집글 작성"으로 나만의 조건을 설정하고 모집하세요.',
              },
            ]}
            cta={{ label: '덕메 찾으러 가기', href: '/' }}
          />

          {/* ── 섹션 2: 비계친 찾기 ── */}
          <GuideSection
            index={2}
            title="비계친 찾기"
            subtitle="비슷한 덕질 취향, 같은 세계관을 공유할 온라인 친구"
            accentFrom="#fdf2f8"
            accentTo="#fce7f3"
            headingColor="#9d174d"
            labelColor="#db2777"
            sphereGrads={[
              ['#fdf2f8','#fbcfe8','#f9a8d4'],
              ['#fce7f3','#f9a8d4','#f472b6'],
              ['#fff1f9','#fce7f3','#fbcfe8'],
            ]}
            steps={[
              {
                emoji: '🛡️',
                label: '세이프 존 설정',
                description: '프로필에서 세이프 존 키워드를 설정하면 비계친 모집글에 자동 반영돼요.',
              },
              {
                emoji: '🌙',
                label: '페르소나 선택',
                description: '비계친 모집 시 활성 페르소나 이모지가 글 프로필에 표시돼요. 나다운 페르소나로 소통하세요.',
              },
              {
                emoji: '🚫',
                label: '이런 분은 사절',
                description: '글 작성 시 제한 키워드를 설정해서 원하지 않는 유형을 미리 필터링할 수 있어요.',
              },
            ]}
            cta={{ label: '비계친 찾으러 가기', href: '/?tab=buddy' }}
          />

          {/* ── 섹션 3: 안전한 매칭 ── */}
          <GuideSection
            index={3}
            title="안전하게 만나기"
            subtitle="flyfan의 신고 & 세이프 존 시스템"
            accentFrom="#f0f9ff"
            accentTo="#e0f2fe"
            headingColor="#075985"
            labelColor="#0369a1"
            sphereGrads={[
              ['#f0f9ff','#bae6fd','#7dd3fc'],
              ['#e0f2fe','#7dd3fc','#38bdf8'],
              ['#f8faff','#dbeafe','#bfdbfe'],
            ]}
            steps={[
              {
                emoji: '🚩',
                label: '신고하기',
                description: '불편한 게시글은 오른쪽 상단 깃발 아이콘으로 신고하세요. 관리자가 검토 후 처리해요.',
              },
              {
                emoji: '🔒',
                label: '비밀 댓글',
                description: '댓글 입력창의 자물쇠를 누르면 작성자와 나만 볼 수 있는 비밀 댓글을 달 수 있어요.',
              },
              {
                emoji: '✅',
                label: '인증된 팬 키워드',
                description: '세이프 존 키워드 "인증된 팬"을 설정하면 검증된 팬들과의 매칭 확률이 높아져요.',
              },
            ]}
          />

          {/* ── 화면 가이드 ── */}
          <ScreenGuide />

          {/* ── 시작하기 CTA ── */}
          <div className="px-5 mb-4">
            <div
              className="relative overflow-hidden rounded-[28px] p-6 text-center"
              style={{ background:'linear-gradient(135deg, #fce7f3 0%, #f5d0fe 45%, #ede9fe 100%)' }}
            >
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <Sphere size={80} grad={['#fff1f9','#f9a8d4','#e879f9']}
                  style={{ position:'absolute', right:-20, top:-20, opacity:0.75 }} />
                <Sphere size={48} grad={['#f5f3ff','#ddd6fe','#c4b5fd']}
                  style={{ position:'absolute', left:-10, bottom:-10, opacity:0.75 }} />
              </div>
              <div className="relative z-10">
                <p className="text-[26px] font-extrabold mb-1" style={{ color:'#5b21b6' }}>지금 시작해요 💎</p>
                <p className="text-[13px] mb-5" style={{ color:'#a855f7' }}>
                  취향 맞는 덕질 친구를 만나보세요
                </p>
                <Link href="/">
                  <button
                    className="h-12 px-10 rounded-full text-[15px] font-extrabold"
                    style={{ backgroundColor:'rgba(255,255,255,0.9)', color:'#7c3aed' }}
                  >
                    홈으로 가기
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <BottomNavBar />
    </>
  )
}
