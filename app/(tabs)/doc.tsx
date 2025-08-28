// // import React, { useState, useEffect } from 'react';
// // import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Dimensions, Platform, ActivityIndicator } from 'react-native';
// // import { Ionicons } from '@expo/vector-icons';
// // import { router } from 'expo-router';
// // import { listDocuments, exportDocument } from '@/lib/api';

// // const { width } = Dimensions.get('window');

// // export default function DocumentsScreen() {
// //   const [documents, setDocuments] = useState<any[]>([]);
// //   const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [selectedFilter, setSelectedFilter] = useState('all');

// //   useEffect(() => {
// //     loadDocuments();
// //   }, []);

// //   useEffect(() => {
// //     filterDocuments();
// //   }, [searchQuery, selectedFilter, documents]);

// //   const loadDocuments = async () => {
// //     try {
// //       setIsLoading(true);
// //       const docs = await listDocuments();
// //       const docsArray = Array.isArray(docs) ? docs : docs.results || [];
// //       setDocuments(docsArray);
// //     } catch (error) {
// //       console.log('Failed to load documents:', error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const filterDocuments = () => {
// //     let filtered = documents;

// //     // Apply type filter
// //     if (selectedFilter !== 'all') {
// //       filtered = filtered.filter(doc => doc.doc_type === selectedFilter);
// //     }

// //     // Apply search filter
// //     if (searchQuery.trim()) {
// //       const query = searchQuery.toLowerCase();
// //       filtered = filtered.filter(doc =>
// //         doc.title?.toLowerCase().includes(query) ||
// //         doc.content?.toLowerCase().includes(query) ||
// //         doc.doc_type?.toLowerCase().includes(query)
// //       );
// //     }

// //     setFilteredDocuments(filtered);
// //   };

// //   const handleExport = async (docId: number, format: string) => {
// //     try {
// //       const response = await exportDocument(docId, format);
// //       if (Platform.OS === 'web') {
// //         const blob = new Blob([response.data], {
// //           type: response.headers?.['content-type'] || 'application/octet-stream'
// //         });
// //         const url = URL.createObjectURL(blob);
// //         const a = document.createElement('a');
// //         a.href = url;
// //         a.download = `document-${docId}.${format}`;
// //         document.body.appendChild(a);
// //         a.click();
// //         a.remove();
// //         URL.revokeObjectURL(url);
// //       }
// //     } catch (error) {
// //       console.log('Export failed:', error);
// //     }
// //   };

// //   const getDocumentIcon = (docType: string) => {
// //     const iconMap: { [key: string]: string } = {
// //       resume: 'person',
// //       cover_letter: 'mail',
// //       report: 'analytics',
// //       note: 'document-text',
// //       letter: 'mail-open',
// //       proposal: 'briefcase',
// //       essay: 'school',
// //       article: 'newspaper',
// //     };
// //     return iconMap[docType] || 'document-text';
// //   };

// //   const getDocumentColor = (docType: string) => {
// //     const colorMap: { [key: string]: string } = {
// //       resume: '#667eea',
// //       cover_letter: '#10b981',
// //       report: '#f59e0b',
// //       note: '#8b5cf6',
// //       letter: '#ef4444',
// //       proposal: '#06b6d4',
// //       essay: '#84cc16',
// //       article: '#f97316',
// //     };
// //     return colorMap[docType] || '#6b7280';
// //   };

// //   const filters = [
// //     { key: 'all', label: 'All', icon: 'apps' },
// //     { key: 'resume', label: 'Resumes', icon: 'person' },
// //     { key: 'cover_letter', label: 'Cover Letters', icon: 'mail' },
// //     { key: 'report', label: 'Reports', icon: 'analytics' },
// //     { key: 'note', label: 'Notes', icon: 'document-text' },
// //   ];

// //   const exportFormats = [
// //     { key: 'txt', label: 'TXT', icon: 'document-text' },
// //     { key: 'json', label: 'JSON', icon: 'code' },
// //     { key: 'pdf', label: 'PDF', icon: 'document' },
// //     { key: 'docx', label: 'DOC', icon: 'document-text' },
// //   ];

// //   if (isLoading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#667eea" />
// //         <Text style={styles.loadingText}>Loading your documents...</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
// //       {/* Header Section */}
// //       <View style={styles.header}>
// //         <View style={styles.headerContent}>
// //           <Text style={styles.headerTitle}>My Documents</Text>
// //           <Text style={styles.headerSubtitle}>
// //             {documents.length} document{documents.length !== 1 ? 's' : ''} in your library
// //           </Text>
// //         </View>
// //         <Pressable
// //           style={styles.createButton}
// //           onPress={() => router.push('/generator' as any)}
// //         >
// //           <Ionicons name="add" size={24} color="#ffffff" />
// //           <Text style={styles.createButtonText}>Create New</Text>
// //         </Pressable>
// //       </View>

// //       {/* Search and Filters */}
// //       <View style={styles.searchSection}>
// //         <View style={styles.searchContainer}>
// //           <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
// //           <TextInput
// //             style={styles.searchInput}
// //             placeholder="Search documents..."
// //             placeholderTextColor="#9ca3af"
// //             value={searchQuery}
// //             onChangeText={setSearchQuery}
// //           />
// //           {searchQuery.length > 0 && (
// //             <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearch}>
// //               <Ionicons name="close-circle" size={20} color="#9ca3af" />
// //             </Pressable>
// //           )}
// //         </View>

// //         <ScrollView
// //           horizontal
// //           showsHorizontalScrollIndicator={false}
// //           contentContainerStyle={styles.filtersContainer}
// //         >
// //           {filters.map((filter) => (
// //             <Pressable
// //               key={filter.key}
// //               style={[
// //                 styles.filterChip,
// //                 selectedFilter === filter.key && styles.filterChipActive
// //               ]}
// //               onPress={() => setSelectedFilter(filter.key)}
// //             >
// //               <Ionicons
// //                 name={filter.icon as any}
// //                 size={16}
// //                 color={selectedFilter === filter.key ? '#ffffff' : '#6b7280'}
// //               />
// //               <Text style={[
// //                 styles.filterChipText,
// //                 selectedFilter === filter.key && styles.filterChipTextActive
// //               ]}>
// //                 {filter.label}
// //               </Text>
// //             </Pressable>
// //           ))}
// //         </ScrollView>
// //       </View>

// //       {/* Documents List */}
// //       <View style={styles.documentsSection}>
// //         {filteredDocuments.length === 0 ? (
// //           <View style={styles.emptyState}>
// //             {searchQuery || selectedFilter !== 'all' ? (
// //               <>
// //                 <Ionicons name="search" size={64} color="#9ca3af" />
// //                 <Text style={styles.emptyStateTitle}>No documents found</Text>
// //                 <Text style={styles.emptyStateText}>
// //                   Try adjusting your search or filter criteria
// //                 </Text>
// //                 <Pressable
// //                   style={styles.resetFiltersButton}
// //                   onPress={() => {
// //                     setSearchQuery('');
// //                     setSelectedFilter('all');
// //                   }}
// //                 >
// //                   <Text style={styles.resetFiltersButtonText}>Reset Filters</Text>
// //                 </Pressable>
// //               </>
// //             ) : (
// //               <>
// //                 <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
// //                 <Text style={styles.emptyStateTitle}>No documents yet</Text>
// //                 <Text style={styles.emptyStateText}>
// //                   Create your first document to get started
// //                 </Text>
// //                 <Pressable
// //                   style={styles.createFirstButton}
// //                   onPress={() => router.push('/generator' as any)}
// //                 >
// //                   <Ionicons name="add" size={20} color="#ffffff" />
// //                   <Text style={styles.createFirstButtonText}>Create Document</Text>
// //                 </Pressable>
// //               </>
// //             )}
// //           </View>
// //         ) : (
// //           <View style={styles.documentsList}>
// //             {filteredDocuments.map((doc, index) => (
// //               <View key={doc.id || index} style={styles.documentCard}>
// //                 <View style={styles.documentHeader}>
// //                   <View style={styles.documentInfo}>
// //                     <View style={[
// //                       styles.documentIcon,
// //                       { backgroundColor: getDocumentColor(doc.doc_type) }
// //                     ]}>
// //                       <Ionicons
// //                         name={getDocumentIcon(doc.doc_type) as any}
// //                         size={24}
// //                         color="#ffffff"
// //                       />
// //                     </View>
// //                     <View style={styles.documentDetails}>
// //                       <Text style={styles.documentTitle}>
// //                         {doc.title || 'Untitled Document'}
// //                       </Text>
// //                       <Text style={styles.documentType}>
// //                         {doc.doc_type?.replace('_', ' ') || 'Document'}
// //                       </Text>
// //                       <Text style={styles.documentDate}>
// //                         {new Date(doc.created_at).toLocaleDateString()}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                   <View style={styles.documentActions}>
// //                     <Pressable style={styles.actionButton}>
// //                       <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
// //                     </Pressable>
// //                   </View>
// //                 </View>

// //                 {doc.content && (
// //                   <View style={styles.documentContent}>
// //                     <Text style={styles.contentPreview} numberOfLines={3}>
// //                       {doc.content}
// //                     </Text>
// //                   </View>
// //                 )}

// //                 <View style={styles.documentFooter}>
// //                   <View style={styles.exportSection}>
// //                     <Text style={styles.exportLabel}>Export as:</Text>
// //                     <View style={styles.exportFormats}>
// //                       {exportFormats.map((format) => (
// //                         <Pressable
// //                           key={format.key}
// //                           style={styles.exportButton}
// //                           onPress={() => handleExport(doc.id, format.key)}
// //                         >
// //                           <Ionicons
// //                             name={format.icon as any}
// //                             size={16}
// //                             color="#667eea"
// //                           />
// //                           <Text style={styles.exportButtonText}>{format.label}</Text>
// //                         </Pressable>
// //                       ))}
// //                     </View>
// //                   </View>
// //                 </View>
// //               </View>
// //             ))}
// //           </View>
// //         )}
// //       </View>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f8fafc',
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#f8fafc',
// //   },
// //   loadingText: {
// //     fontSize: 16,
// //     color: '#6b7280',
// //     marginTop: 16,
// //     fontWeight: '500',
// //   },
// //   header: {
// //     backgroundColor: '#ffffff',
// //     paddingTop: 20,
// //     paddingBottom: 24,
// //     paddingHorizontal: 20,
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   headerContent: {
// //     flex: 1,
// //   },
// //   headerTitle: {
// //     fontSize: 28,
// //     fontWeight: '800',
// //     color: '#1f2937',
// //     marginBottom: 4,
// //   },
// //   headerSubtitle: {
// //     fontSize: 16,
// //     color: '#6b7280',
// //     fontWeight: '500',
// //   },
// //   createButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#667eea',
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     borderRadius: 12,
// //     shadowColor: '#667eea',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   createButtonText: {
// //     color: '#ffffff',
// //     fontSize: 14,
// //     fontWeight: '600',
// //     marginLeft: 8,
// //   },
// //   searchSection: {
// //     backgroundColor: '#ffffff',
// //     paddingHorizontal: 20,
// //     paddingBottom: 20,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#e5e7eb',
// //   },
// //   searchContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#f9fafb',
// //     borderRadius: 12,
// //     borderWidth: 2,
// //     borderColor: '#e5e7eb',
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     marginBottom: 16,
// //   },
// //   searchIcon: {
// //     marginRight: 12,
// //   },
// //   searchInput: {
// //     flex: 1,
// //     fontSize: 16,
// //     color: '#1f2937',
// //     fontWeight: '500',
// //   },
// //   clearSearch: {
// //     padding: 4,
// //   },
// //   filtersContainer: {
// //     paddingRight: 20,
// //   },
// //   filterChip: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: 8,
// //     paddingHorizontal: 16,
// //     borderRadius: 20,
// //     backgroundColor: '#f3f4f6',
// //     borderWidth: 2,
// //     borderColor: 'transparent',
// //     marginRight: 12,
// //     gap: 6,
// //   },
// //   filterChipActive: {
// //     backgroundColor: '#667eea',
// //     borderColor: '#667eea',
// //   },
// //   filterChipText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#6b7280',
// //   },
// //   filterChipTextActive: {
// //     color: '#ffffff',
// //   },
// //   documentsSection: {
// //     padding: 20,
// //   },
// //   documentsList: {
// //     gap: 16,
// //   },
// //   documentCard: {
// //     backgroundColor: '#ffffff',
// //     borderRadius: 16,
// //     padding: 20,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 3,
// //   },
// //   documentHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'flex-start',
// //     marginBottom: 16,
// //   },
// //   documentInfo: {
// //     flexDirection: 'row',
// //     flex: 1,
// //   },
// //   documentIcon: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 12,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginRight: 16,
// //   },
// //   documentDetails: {
// //     flex: 1,
// //   },
// //   documentTitle: {
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: '#1f2937',
// //     marginBottom: 4,
// //   },
// //   documentType: {
// //     fontSize: 14,
// //     color: '#6b7280',
// //     marginBottom: 4,
// //     textTransform: 'capitalize',
// //     fontWeight: '500',
// //   },
// //   documentDate: {
// //     fontSize: 12,
// //     color: '#9ca3af',
// //     fontWeight: '500',
// //   },
// //   documentActions: {
// //     padding: 4,
// //   },
// //   actionButton: {
// //     padding: 8,
// //     borderRadius: 8,
// //   },
// //   documentContent: {
// //     marginBottom: 16,
// //     paddingTop: 16,
// //     borderTopWidth: 1,
// //     borderTopColor: '#f3f4f6',
// //   },
// //   contentPreview: {
// //     fontSize: 14,
// //     color: '#6b7280',
// //     lineHeight: 20,
// //     fontStyle: 'italic',
// //   },
// //   documentFooter: {
// //     paddingTop: 16,
// //     borderTopWidth: 1,
// //     borderTopColor: '#f3f4f6',
// //   },
// //   exportSection: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //   },
// //   exportLabel: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#374151',
// //   },
// //   exportFormats: {
// //     flexDirection: 'row',
// //     gap: 8,
// //   },
// //   exportButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: 6,
// //     paddingHorizontal: 12,
// //     borderRadius: 16,
// //     backgroundColor: '#f0f4ff',
// //     borderWidth: 1,
// //     borderColor: '#dbeafe',
// //     gap: 4,
// //   },
// //   exportButtonText: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: '#667eea',
// //   },
// //   emptyState: {
// //     alignItems: 'center',
// //     padding: 60,
// //     backgroundColor: '#ffffff',
// //     borderRadius: 16,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 3,
// //   },
// //   emptyStateTitle: {
// //     fontSize: 20,
// //     fontWeight: '600',
// //     color: '#374151',
// //     marginTop: 16,
// //     marginBottom: 8,
// //     textAlign: 'center',
// //   },
// //   emptyStateText: {
// //     fontSize: 16,
// //     color: '#6b7280',
// //     textAlign: 'center',
// //     lineHeight: 24,
// //     marginBottom: 24,
// //   },
// //   resetFiltersButton: {
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     borderRadius: 8,
// //     backgroundColor: '#f3f4f6',
// //     borderWidth: 1,
// //     borderColor: '#e5e7eb',
// //   },
// //   resetFiltersButtonText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#6b7280',
// //   },
// //   createFirstButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#667eea',
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     borderRadius: 8,
// //     shadowColor: '#667eea',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   createFirstButtonText: {
// //     color: '#ffffff',
// //     fontSize: 14,
// //     fontWeight: '600',
// //     marginLeft: 8,
// //   },
// // });


// import React, { useEffect, useState } from 'react';
// import { View, Text, ScrollView, Pressable, Platform, Alert } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import { getDocument } from '@/lib/api';

// export default function DocScreen() {
//   const params = useLocalSearchParams<{ id?: string }>();
//   const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
//   const id = idParam ? parseInt(idParam, 10) : undefined;
//   const [doc, setDoc] = useState<any>();
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!id) return;
//     (async () => {
//       setLoading(true);
//       try { setDoc(await getDocument(id)); } finally { setLoading(false); }
//     })();
//   }, [id]);

//   const exportPdf = async () => {
//     if (!doc) return;
//     try {
//       if (Platform.OS === 'web') {
//         // Simple fallback: open printable page
//         const html = `<!doctype html><html><head><meta charset='utf-8'><title>${doc?.title || 'Document'}</title></head><body><h1>${doc?.title || ''}</h1><pre style="white-space:pre-wrap;font-family:Inter, system-ui, sans-serif;">${doc?.content || ''}</pre></body></html>`;
//         const blob = new Blob([html], { type: 'text/html' });
//         const url = URL.createObjectURL(blob);
//         window.open(url, '_blank');
//         return;
//       }
//       const { default: RNHTMLtoPDF } = await import('react-native-html-to-pdf');
//       const file = await RNHTMLtoPDF.convert({
//         html: `<!doctype html><html><head><meta charset='utf-8'><style>body{font-family:-apple-system,system-ui,Roboto,Segoe UI; padding:16px;} h1{font-size:22px;} pre{white-space:pre-wrap;}</style></head><body><h1>${doc?.title || 'Document'}</h1><pre>${doc?.content || ''}</pre></body></html>`,
//         fileName: (doc?.title || 'document').replace(/\W+/g, '-').toLowerCase(),
//         base64: false,
//       });
//       try {
//         const Sharing = await import('expo-sharing');
//         if (Sharing && Sharing.isAvailableAsync && (await Sharing.isAvailableAsync())) {
//           await Sharing.shareAsync(file.filePath || file.file, {} as any);
//         } else {
//           Alert.alert('Saved', `PDF saved at: ${file.filePath || file.file}`);
//         }
//       } catch {
//         Alert.alert('Saved', `PDF saved at: ${file.filePath || file.file}`);
//       }
//     } catch (e: any) {
//       Alert.alert('Export failed', e?.message || 'Could not export PDF');
//     }
//   };

//   if (!id) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>No document selected</Text></View>;

//   return (
//     <ScrollView style={{ flex: 1, padding: 16 }}>
//       <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{doc?.title || 'Document'}</Text>
//       <Text style={{ color: '#6b7280', marginBottom: 16 }}>{doc?.doc_type}</Text>
//       <Text style={{ fontSize: 16, lineHeight: 22 }}>{doc?.content}</Text>
//       <Pressable style={{ marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: '#5B6CFF' }} onPress={exportPdf} disabled={loading}>
//         <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Exporting…' : 'Export as PDF'}</Text>
//       </Pressable>
//     </ScrollView>
//   );
// }
