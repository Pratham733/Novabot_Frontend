import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '@/components/Layout';
import { listDocuments, exportDocument } from '@/lib/api';

interface Doc { id: number; title: string; content?: string; created_at: string; doc_type: string; }

const timeframes = [
  { key: 'all', label: 'All Time', icon: 'apps' },
  { key: 'today', label: 'Today', icon: 'today' },
  { key: 'week', label: 'Week', icon: 'calendar' },
  { key: 'month', label: 'Month', icon: 'calendar-outline' },
  { key: 'year', label: 'Year', icon: 'calendar-number' },
];

const exportFormats = [
  { key: 'txt', label: 'TXT', icon: 'document-text' },
  { key: 'json', label: 'JSON', icon: 'code' },
  { key: 'doc', label: 'DOC', icon: 'document-text' },
];

export default function HistoryPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [frame, setFrame] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listDocuments();
      const arr = Array.isArray(data) ? data : data?.results || [];
      arr.sort((a:any,b:any)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setDocs(arr);
    } finally { setLoading(false); }
  }

  function formatDate(s: string) {
    const d = new Date(s); const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff/86400000);
    if (days <= 0) return 'Today'; if (days === 1) return 'Yesterday'; if (days < 7) return days+ 'd ago'; if (days < 30) return Math.floor(days/7)+'w ago'; if (days<365) return Math.floor(days/30)+'mo ago'; return Math.floor(days/365)+'y ago';
  }
  function getIcon(t:string){const m:any={report:'analytics',proposal:'briefcase',email:'mail',summary:'document-text',presentation:'easel',contract:'reader'};return m[t]||'document-text';}
  function getColor(t:string){const m:any={report:'#3b82f6',proposal:'#10b981',email:'#f59e0b',summary:'#8b5cf6',presentation:'#ef4444',contract:'#06b6d4'};return m[t]||'#475569';}

  function filter(list:Doc[]){ if(frame==='all') return list; const map:any={today:1,week:7,month:30,year:365}; const cutoff=new Date(Date.now()-map[frame]*86400000); return list.filter(d=> new Date(d.created_at)>=cutoff);}  
  const filtered = filter(docs);

  async function handleExport(id:number, fmt:string){ try { const backendFmt=fmt==='doc'?'docx':fmt; const res= await exportDocument(id, backendFmt); if(Platform.OS==='web'){ const blob=new Blob([res.data],{type: res.headers?.['content-type']||'application/octet-stream'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`document-${id}.${backendFmt}`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);} } catch(e){ /* silent */ } }

  return (
    <Layout title="Document History" subtitle="Track your document creation journey">
      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color="#3b82f6" /><Text style={styles.loadingTxt}>Loading...</Text></View>
      ):(
        <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
          <View style={styles.filtersCard}>
            <Text style={styles.sectionTitle}>Filter by Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {timeframes.map(tf => (
                <Pressable key={tf.key} onPress={()=>setFrame(tf.key)} style={[styles.filterChip, frame===tf.key && styles.filterChipActive]}>
                  <Ionicons name={tf.icon as any} size={14} color={frame===tf.key?'#fff':'#94a3b8'} />
                  <Text style={[styles.filterChipText, frame===tf.key && styles.filterChipTextActive]}>{tf.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="document-text" size={20} color="#3b82f6" />
              <View style={{marginLeft:10}}><Text style={styles.statValue}>{filtered.length}</Text><Text style={styles.statLabel}>{frame==='all'?'All Time':timeframes.find(t=>t.key===frame)?.label}</Text></View>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="trending-up" size={20} color="#10b981" />
              <View style={{marginLeft:10}}><Text style={styles.statValue}>{docs.length?Math.round(filtered.length/docs.length*100):0}%</Text><Text style={styles.statLabel}>Of Total</Text></View>
            </View>
          </View>
          <View style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>Document Timeline</Text>
            {filtered.length===0 ? (
              <View style={styles.emptyWrap}><Ionicons name="time" size={40} color="#64748b" /><Text style={styles.emptyTitle}>No documents</Text><Text style={styles.emptySub}>Create your first document or change the timeframe.</Text></View>
            ):(
              <View>
                {filtered.map((d,i)=> (
                  <View key={d.id} style={styles.itemRow}>
                    {i<filtered.length-1 && <View style={styles.connector} />}
                    <View style={[styles.dot,{backgroundColor:getColor(d.doc_type)}]}>
                      <Ionicons name={getIcon(d.doc_type) as any} size={12} color="#fff" />
                    </View>
                    <View style={styles.docCard}>
                      <Text style={styles.docTitle}>{d.title || 'Untitled'}</Text>
                      <Text style={styles.docMeta}>{d.doc_type}</Text>
                      <Text style={styles.docDate}>{formatDate(d.created_at)}</Text>
                      {d.content && <Text numberOfLines={3} style={styles.docPreview}>{d.content}</Text>}
                      <View style={styles.exportRow}>
                        <Text style={styles.exportLabel}>Export:</Text>
                        <View style={styles.exportBtns}>
                          {exportFormats.map(f=> (
                            <Pressable key={f.key} style={styles.exportBtn} onPress={()=>handleExport(d.id,f.key)}>
                              <Ionicons name={f.icon as any} size={14} color="#3b82f6" />
                              <Text style={styles.exportBtnTxt}>{f.label}</Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  loadingWrap:{alignItems:'center',padding:40},
  loadingTxt:{color:'#94a3b8',marginTop:16},
  filtersCard:{backgroundColor:'rgba(255,255,255,0.05)',borderRadius:16,padding:20,marginBottom:24,borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  sectionTitle:{fontSize:18,fontWeight:'700',color:'#fff',marginBottom:16},
  filterRow:{gap:12},
  filterChip:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.07)',paddingVertical:8,paddingHorizontal:14,borderRadius:20,gap:6,borderWidth:1,borderColor:'rgba(255,255,255,0.12)'},
  filterChipActive:{backgroundColor:'#3b82f6',borderColor:'#3b82f6'},
  filterChipText:{color:'#94a3b8',fontSize:13,fontWeight:'600'},
  filterChipTextActive:{color:'#fff'},
  statsRow:{flexDirection:'row',gap:20,marginBottom:24},
  statBox:{flex:1,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.05)',padding:18,borderRadius:16,borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  statValue:{color:'#fff',fontWeight:'700',fontSize:20},
  statLabel:{color:'#94a3b8',fontSize:12,fontWeight:'500'},
  timelineCard:{backgroundColor:'rgba(255,255,255,0.05)',borderRadius:16,padding:20,marginBottom:24,borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  emptyWrap:{alignItems:'center',paddingVertical:40},
  emptyTitle:{color:'#fff',fontSize:18,fontWeight:'600',marginTop:16},
  emptySub:{color:'#94a3b8',fontSize:14,textAlign:'center',lineHeight:20,marginTop:8,maxWidth:500},
  itemRow:{marginBottom:28,paddingLeft:44,position:'relative'},
  connector:{position:'absolute',left:23,top:14,width:2,height:'100%',backgroundColor:'rgba(255,255,255,0.08)'},
  dot:{position:'absolute',left:14,top:8,width:18,height:18,borderRadius:9,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'#0f172a'},
  docCard:{backgroundColor:'rgba(255,255,255,0.05)',borderRadius:16,padding:16,borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
  docTitle:{color:'#fff',fontSize:16,fontWeight:'700',marginBottom:4},
  docMeta:{color:'#3b82f6',fontSize:12,fontWeight:'600',textTransform:'capitalize',marginBottom:4},
  docDate:{color:'#94a3b8',fontSize:11,fontWeight:'500',marginBottom:8},
  docPreview:{color:'#cbd5e1',fontSize:13,lineHeight:18,fontStyle:'italic',marginBottom:12},
  exportRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  exportLabel:{color:'#94a3b8',fontSize:12,fontWeight:'600',marginRight:12},
  exportBtns:{flexDirection:'row',gap:8},
  exportBtn:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(59,130,246,0.12)',paddingVertical:6,paddingHorizontal:12,borderRadius:14,borderWidth:1,borderColor:'rgba(59,130,246,0.3)',gap:6},
  exportBtnTxt:{color:'#3b82f6',fontSize:12,fontWeight:'600'},
});
